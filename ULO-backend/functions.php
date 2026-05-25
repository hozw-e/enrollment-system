<?php

// =============================================
// DATABASE QUERY HELPER
// =============================================

function execQuery($sql, $values, $pdo) {
  $data = [];
  $stmt = $pdo->prepare($sql);
  try {
    $stmt->execute($values);
    $res = $stmt->fetchAll();
    if ($res) {
      $data = $res;
    } else {
      if ($stmt->nextRowset()) {
        $res = $stmt->fetchAll();
        if ($res) {
          $data = $res;
        }
      }
    }
    $stmt->closeCursor();
  } catch (\PDOException $er) {
    error_log("execQuery error: " . $er->getMessage());
    http_response_code(400);
  }
  return $data;
}


// =============================================
// JWT AUTHENTICATION (Firebase/JWT)
// =============================================

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function generateJWT() {
  $key = SECRET_KEY;
  $exp = time() + (60 * 60 * 24); // expires in 24 hours
  $p = [
    "ito" => "enrollment-system",
    "iby" => "BSCS3A",
    "ie"  => "bscs3a@test.com",
    "exp" => $exp
  ];
  return JWT::encode($p, $key, "HS256");
}


// =============================================
// PASSWORD HASHING (using password_hash)
// =============================================

function generatePassword($pword) {
  return password_hash($pword, PASSWORD_BCRYPT);
}

function checkPassword($pwPlain, $pwHash) {
  return password_verify($pwPlain, $pwHash);
}


// =============================================
// AES-256-GCM ENCRYPTION (API Transport Layer)
// =============================================

/**
 * Get the transport encryption key as raw 32 bytes (256 bits)
 * Used for encrypting/decrypting API request/response payloads
 * Key is stored as hex in .env and converted via hex2bin()
 */
function getEncryptionKey() {
  return hex2bin(SECRET_KEY);
}

/**
 * Get the database encryption key as raw 32 bytes (256 bits)
 * Used for encrypting/decrypting sensitive fields stored in the database
 * This is a SEPARATE key from the transport key for defense-in-depth
 */
function getDbEncryptionKey() {
  return hex2bin(DB_SECRET_KEY);
}

/**
 * Encrypt data for API response transmission
 */
function encryptData($dt) {
  $key       = getEncryptionKey();
  $algo      = ALGO;
  $plainText = json_encode($dt);
  $ivLength  = 12; // 12 bytes recommended for GCM
  $iv        = openssl_random_pseudo_bytes($ivLength);
  $tag       = '';

  $cipherText = openssl_encrypt($plainText, $algo, $key, OPENSSL_RAW_DATA, $iv, $tag);

  $output = json_encode([
    "payload" => base64_encode(json_encode([
      "data" => base64_encode($cipherText),
      "iv"   => base64_encode($iv),
      "tag"  => base64_encode($tag)
    ]))
  ]);

  return $output;
}

/**
 * Decrypt data from API request
 */
function decryptData($dt) {
  $key  = getEncryptionKey();
  $algo = ALGO;

  $parsed = is_string($dt) ? json_decode($dt) : $dt;

  if (!isset($parsed->payload)) {
    throw new Exception("Invalid Format: missing payload");
  }

  $decodedB64 = base64_decode($parsed->payload);
  $inner      = json_decode($decodedB64, true);

  if (!isset($inner['data'], $inner['tag'], $inner['iv'])) {
    throw new Exception("Invalid Format: missing data/tag/iv");
  }

  $cipherText = base64_decode($inner['data']);
  $iv         = base64_decode($inner['iv']);
  $tag        = base64_decode($inner['tag']);

  $plainText = openssl_decrypt($cipherText, $algo, $key, OPENSSL_RAW_DATA, $iv, $tag);

  if ($plainText === false) {
    throw new Exception("Decryption failed");
  }

  return $plainText;
}


// =============================================
// AES-256-GCM ENCRYPTION (Database Storage)
// Used to encrypt sensitive fields before INSERT
// and decrypt after SELECT
// =============================================

/**
 * Encrypt a single field value for database storage
 * Returns a JSON string containing: encrypted data, IV, and tag
 */
function encryptField($value) {
  if ($value === null || $value === '') {
    return $value;
  }

  $key      = getDbEncryptionKey();
  $algo     = ALGO;
  $iv       = openssl_random_pseudo_bytes(12);
  $tag      = '';

  $cipherText = openssl_encrypt($value, $algo, $key, OPENSSL_RAW_DATA, $iv, $tag);

  return base64_encode(json_encode([
    'data' => base64_encode($cipherText),
    'iv'   => base64_encode($iv),
    'tag'  => base64_encode($tag)
  ]));
}

/**
 * Decrypt a single field value retrieved from database
 * Expects the JSON format produced by encryptField()
 */
function decryptField($encryptedValue) {
  if ($encryptedValue === null || $encryptedValue === '') {
    return $encryptedValue;
  }

  $key  = getDbEncryptionKey();
  $algo = ALGO;

  try {
    $decoded = base64_decode($encryptedValue, true);

    // If base64 decode fails, it's plain text — return as-is
    if ($decoded === false) {
      return $encryptedValue;
    }

    $inner = json_decode($decoded, true);

    if (!is_array($inner) || !isset($inner['data'], $inner['iv'], $inner['tag'])) {
      // Not encrypted data, return as-is (backward compatibility with plain text)
      return $encryptedValue;
    }

    $cipherText = base64_decode($inner['data']);
    $iv         = base64_decode($inner['iv']);
    $tag        = base64_decode($inner['tag']);

    if ($cipherText === false || $iv === false || $tag === false) {
      return $encryptedValue;
    }

    // Try current DB_SECRET key (hex-decoded)
    $plainText = openssl_decrypt($cipherText, $algo, $key, OPENSSL_RAW_DATA, $iv, $tag);

    if ($plainText === false) {
      // Try transport SECRET key (hex-decoded)
      $transportKey = getEncryptionKey();
      $plainText = openssl_decrypt($cipherText, $algo, $transportKey, OPENSSL_RAW_DATA, $iv, $tag);
    }

    if ($plainText === false && defined('LEGACY_KEY') && LEGACY_KEY !== '') {
      // Try legacy key: the original raw string secret used before hex-based keys
      $plainText = openssl_decrypt($cipherText, $algo, LEGACY_KEY, OPENSSL_RAW_DATA, $iv, $tag);
    }

    if ($plainText === false) {
      // Try SECRET_KEY as raw string (not hex-decoded)
      $plainText = openssl_decrypt($cipherText, $algo, SECRET_KEY, OPENSSL_RAW_DATA, $iv, $tag);
    }

    if ($plainText === false) {
      error_log("decryptField: All decryption attempts failed. Value prefix: " . substr($encryptedValue, 0, 30));
      return $encryptedValue;
    }

    return $plainText;
  } catch (Exception $e) {
    error_log("decryptField error: " . $e->getMessage());
    return $encryptedValue;
  }
}

/**
 * Encrypt multiple fields in an associative array
 * @param array $data - the data array
 * @param array $fields - list of field names to encrypt
 * @return array - data with specified fields encrypted
 */
function encryptFields($data, $fields) {
  foreach ($fields as $field) {
    if (isset($data[$field]) && $data[$field] !== null && $data[$field] !== '') {
      $data[$field] = encryptField($data[$field]);
    }
  }
  return $data;
}

/**
 * Decrypt multiple fields in an associative array
 * @param array $data - the data array (single row)
 * @param array $fields - list of field names to decrypt
 * @return array - data with specified fields decrypted
 */
function decryptFields($data, $fields) {
  foreach ($fields as $field) {
    if (isset($data[$field]) && $data[$field] !== null && $data[$field] !== '') {
      $data[$field] = decryptField($data[$field]);
    }
  }
  return $data;
}

/**
 * Decrypt fields in multiple rows
 * @param array $rows - array of associative arrays
 * @param array $fields - list of field names to decrypt
 * @return array - rows with specified fields decrypted
 */
function decryptRows($rows, $fields) {
  return array_map(function($row) use ($fields) {
    return decryptFields($row, $fields);
  }, $rows);
}


// =============================================
// INPUT VALIDATION HELPERS
// =============================================

/**
 * Validate required fields exist in the request data
 * @param object $dt - decoded request data
 * @param array $requiredFields - list of required field names
 * @return array|null - returns error array if validation fails, null if OK
 */
function validateRequired($dt, $requiredFields) {
  $missing = [];
  foreach ($requiredFields as $field) {
    if (!isset($dt->$field) || (is_string($dt->$field) && trim($dt->$field) === '')) {
      $missing[] = $field;
    }
  }
  if (!empty($missing)) {
    return ["error" => "Missing required fields: " . implode(', ', $missing)];
  }
  return null;
}

/**
 * Validate string length
 */
function validateLength($value, $fieldName, $min = 1, $max = 255) {
  $len = strlen(trim($value));
  if ($len < $min || $len > $max) {
    return ["error" => "$fieldName must be between $min and $max characters"];
  }
  return null;
}

/**
 * Validate student number format
 */
function validateStudnum($studnum) {
  if (!preg_match('/^[A-Z0-9]{3,10}$/', $studnum)) {
    return ["error" => "Invalid student number format"];
  }
  return null;
}
