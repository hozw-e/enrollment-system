<?php
  // Set CORS headers
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Content-Type: application/json');

  // Handle preflight requests
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
  }

  require_once __DIR__ . "/vendor/autoload.php";
  require_once __DIR__ . "/functions.php";

  $env = Dotenv\Dotenv::createImmutable(__DIR__ . "/config/");
  $env->load();

  $db = new Connection();
  $pdo = $db->connect();

  $auth = new Auth($pdo);
  $users = new Users($pdo);
  $courses = new Courses($pdo);
  $enrollments = new Enrollments($pdo);
  $admin = new Admin($pdo);
  $reports = new Reports($pdo);
  $students = new Students($pdo);
  $profile = new Profile($pdo);
  
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$param = array_values(array_filter(explode("/", $uri)));
  
  // Decrypt data if present
  $dt = null;
  $input = file_get_contents("php://input");
  if (!empty($input)) {
    try {
      $decrypted = decryptData($input);
      $dt = json_decode($decrypted);
    } catch (Exception $e) {
      http_response_code(400);
      echo json_encode(["error" => "Invalid encrypted data"]);
      exit();
    }
  }
  
  switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
      http_response_code(403);
      break;

    case 'POST':
      switch ($param[0]) {
        // --- Auth ---
        case 'auth':
          switch ($param[1] ?? '') {
            case 'register':
              echo json_encode($auth->register($dt));
              break;
            case 'login':
              echo $auth->login($dt);
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Profile / Users ---
        case 'users':
          switch ($param[1] ?? '') {
            case 'profile':
              echo $users->getUserProfile($dt);
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Profile (full sectioned profile) ---
        case 'profile':
          switch ($param[1] ?? '') {
            case 'full':
              echo encryptData($profile->getFullProfile($dt->studnum));
              break;
            case 'personal':
              echo encryptData($profile->getPersonalInfo($dt->studnum));
              break;
            case 'emergency':
              echo encryptData($profile->getEmergencyContacts($dt->studnum));
              break;
            case 'family':
              echo encryptData($profile->getFamilyBackground($dt->studnum));
              break;
            case 'academic':
              echo encryptData($profile->getAcademicBackground($dt->studnum));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Courses ---
        case 'courses':
          if (isset($param[1]) && $param[1] !== '') {
            // GET /api/courses/{course_id}
            $dt = is_string($dt) ? json_decode($dt) : $dt;
            if (!$dt) $dt = new stdClass();
            $dt->course_id = $param[1];
            echo json_encode($courses->getCourseById($dt));
          } else {
            // GET /api/courses
            echo json_encode($courses->getCourses());
          }
          break;

        // --- Enrollments ---
        case 'enrollments':
          switch ($param[1] ?? '') {
            case 'student':
              // GET /api/enrollments/student/{student_id}
              echo json_encode($enrollments->getEnrollmentsByStudent($dt));
              break;
            case '':
              // POST /api/enrollments
              echo json_encode($enrollments->enrollStudent($dt));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Admin ---
        case 'admin':
          switch ($param[1] ?? '') {
            case 'students':
              echo json_encode($admin->getAllStudents());
              break;
            case 'courses':
              echo json_encode($admin->getAllCourses());
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Reports ---
        case 'reports':
          switch ($param[1] ?? '') {
            case 'enrollments':
              echo json_encode($reports->getEnrollmentReport());
              break;
            case 'course-popularity':
              echo json_encode($reports->getCoursePopularity());
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Existing: Login / Change Password / Students ---
        case 'login':
          echo json_encode($auth->login());
          break;

        case 'changepassword':
          echo json_encode($auth->changePassword($dt));
          break;
      
        case 'students':
          echo json_encode($students->getStudents());
          break;

        case 'decryptdata':
          echo $dt;
          break;
      
        default:
          http_response_code(404);
          break;
      }
      break;

    case 'PUT':
      switch ($param[0]) {
        // --- Create Course (admin) ---
        case 'courses':
          echo json_encode($courses->createCourse($dt));
          break;

        // --- Add Profile Entries ---
        case 'profile':
          switch ($param[1] ?? '') {
            case 'emergency':
              echo encryptData($profile->addEmergencyContact($dt));
              break;
            case 'family':
              echo encryptData($profile->addFamilyMember($dt));
              break;
            case 'academic':
              echo encryptData($profile->addAcademicRecord($dt));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        case 'students':
          echo json_encode($students->insertStudent($dt));
          break;
      
        default:
          http_response_code(404);
          break;
      }
      break;

    case 'PATCH':
      switch ($param[0]) {
        // --- Update Profile ---
        case 'users':
          switch ($param[1] ?? '') {
            case 'profile':
              echo json_encode($users->updateUserProfile($dt));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Update Profile Sections ---
        case 'profile':
          switch ($param[1] ?? '') {
            case 'personal':
              echo encryptData($profile->updatePersonalInfo($dt));
              break;
            case 'emergency':
              echo encryptData($profile->updateEmergencyContact($dt));
              break;
            case 'family':
              echo encryptData($profile->updateFamilyMember($dt));
              break;
            case 'academic':
              echo encryptData($profile->updateAcademicRecord($dt));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Update Course (admin) ---
        case 'courses':
          echo json_encode($courses->updateCourse($dt));
          break;

        case 'students':
          echo json_encode($students->updateStudent($dt));
          break;
      
        default:
          http_response_code(404);
          break;
      }
      break;

    case 'DELETE':
      switch ($param[0]) {
        case 'courses':
          echo json_encode($courses->deleteCourse($dt));
          break;

        // --- Delete Profile Entries ---
        case 'profile':
          switch ($param[1] ?? '') {
            case 'emergency':
              echo json_encode($profile->deleteEmergencyContact($dt));
              break;
            case 'family':
              echo json_encode($profile->deleteFamilyMember($dt));
              break;
            case 'academic':
              echo json_encode($profile->deleteAcademicRecord($dt));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        case 'students':
          echo json_encode($students->archiveStudent($dt));
          break;

        case 'deletestudent':
          echo json_encode($students->deleteStudent($dt));
          break;
      
        default:
          http_response_code(404);
          break;
      }
      break;
    
    default:
      http_response_code(400);
      break;
  }