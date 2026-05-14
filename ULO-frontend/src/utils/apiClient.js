// API Client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'a-string-secret-at-least-256-bit';

/**
 * Convert a string to a Uint8Array
 */
function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to base64 string
 */
function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Get CryptoKey from secret string for AES-256-GCM
 */
async function getCryptoKey() {
  // AES-256 requires exactly 32 bytes key
  const keyBytes = stringToBytes(SECRET_KEY).slice(0, 32);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data to match backend's AES-256-GCM format
 * Backend expects: { payload: base64({ data: base64(ciphertext), iv: base64(iv), tag: base64(tag) }) }
 */
async function encryptData(data) {
  const plainText = JSON.stringify(data);
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for GCM

  const encoded = stringToBytes(plainText);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    encoded
  );

  // Web Crypto API appends the auth tag to the ciphertext
  // AES-GCM tag is always 16 bytes (128 bits)
  const encryptedArray = new Uint8Array(encrypted);
  const cipherText = encryptedArray.slice(0, encryptedArray.length - 16);
  const tag = encryptedArray.slice(encryptedArray.length - 16);

  const inner = JSON.stringify({
    data: bytesToBase64(cipherText),
    iv: bytesToBase64(iv),
    tag: bytesToBase64(tag),
  });

  return JSON.stringify({
    payload: btoa(inner),
  });
}

/**
 * Decrypt data (for encrypted responses from backend)
 */
function decodeResponse(encryptedData) {
  try {
    const parsed = JSON.parse(encryptedData);
    if (parsed.payload) {
      const decodedPayload = atob(parsed.payload);
      return JSON.parse(decodedPayload);
    }
    return parsed;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Make API request to backend
 * @param {string} endpoint - API endpoint (e.g., 'auth/login')
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {object} data - Request data to send
 * @returns {Promise} - Response from backend
 */
export async function apiRequest(endpoint, method = 'POST', data = null) {
  try {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // For POST, PUT, PATCH - encrypt and send data
    if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
      options.body = await encryptData(data);
    }

    console.log(`[API] ${method} ${url}`, data);

    const response = await fetch(url, options);

    // Get response text first
    const responseText = await response.text();

    // Check if response is ok
    if (!response.ok) {
      console.error(`[API Error] ${response.status}:`, responseText);
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    // Try to parse response
    let responseData;

    if (responseText) {
      try {
        // Try to parse as JSON first
        responseData = JSON.parse(responseText);
        
        // Check if it's encrypted (has payload property)
        if (responseData.payload) {
          try {
            responseData = decodeResponse(responseText);
          } catch (e) {
            // If decryption fails, use the parsed JSON as-is
          }
        }
      } catch (e) {
        // If not JSON, return as text
        responseData = responseText;
      }
    }

    console.log(`[API Response]`, responseData);
    return responseData;
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} - Login response with token and user data
 */
export async function login(username, password) {
  try {
    const response = await apiRequest('auth/login', 'POST', {
      username,
      password,
    });

    // Check if response has user data
    if (response && response.token && response.username) {
      // Map numeric role to string (0 = student, 1 = admin)
      const roleMap = { 0: 'student', 1: 'admin' };
      const role = roleMap[response.role] || response.role;
      
      return {
        success: true,
        token: response.token,
        user: {
          username: response.username,
          studnum: response.studnum,
          role: role,
          name: `${response.fname} ${response.lname}`,
          fname: response.fname,
          lname: response.lname,
        },
      };
    } else if (response && response.msg) {
      return {
        success: false,
        message: response.msg,
      };
    }
    
    return {
      success: false,
      message: 'Login failed',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Login failed',
    };
  }
}

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise} - Registration response
 */
export async function register(userData) {
  try {
    const response = await apiRequest('auth/register', 'POST', userData);
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Get user profile
 * @param {string} token - JWT token
 * @returns {Promise} - User profile data
 */
export async function getUserProfile(token) {
  try {
    const response = await apiRequest('users/profile', 'GET');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile
 * @param {object} profileData - Updated profile data
 * @returns {Promise} - Update response
 */
export async function updateProfile(profileData) {
  try {
    const response = await apiRequest('users/profile', 'PATCH', profileData);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all courses
 * @returns {Promise} - List of courses
 */
export async function getCourses() {
  try {
    const response = await apiRequest('courses', 'POST');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise} - Course data
 */
export async function getCourseById(courseId) {
  try {
    const response = await apiRequest(`courses/${courseId}`, 'POST');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Enroll student in course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Enrollment response
 */
export async function enrollCourse(courseId) {
  try {
    const response = await apiRequest('enrollments', 'POST', {
      course_id: courseId,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get student enrollments
 * @param {string} studentId - Student ID
 * @returns {Promise} - List of enrollments
 */
export async function getEnrollments(studentId) {
  try {
    const response = await apiRequest('enrollments/student', 'POST', {
      student_id: studentId,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export default {
  apiRequest,
  login,
  register,
  getUserProfile,
  updateProfile,
  getCourses,
  getCourseById,
  enrollCourse,
  getEnrollments,
};
