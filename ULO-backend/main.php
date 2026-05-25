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
  $colleges = new Colleges($pdo);
  
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
      echo encryptData(["error" => "Invalid encrypted data"]);
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
              echo encryptData($auth->register($dt));
              break;
            case 'login':
              echo encryptData($auth->login($dt));
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
              echo encryptData($users->getUserProfile($dt));
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
            echo encryptData($courses->getCourseById($dt));
          } else {
            // GET /api/courses
            echo encryptData($courses->getCourses());
          }
          break;

        // --- Enrollments ---
        case 'enrollments':
          switch ($param[1] ?? '') {
            case 'student':
              // GET /api/enrollments/student/{student_id}
              echo encryptData($enrollments->getEnrollmentsByStudent($dt));
              break;
            case '':
              // POST /api/enrollments
              echo encryptData($enrollments->enrollStudent($dt));
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
              echo encryptData($admin->getAllStudents());
              break;
            case 'courses':
              echo encryptData($admin->getAllCourses());
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Colleges & Programs ---
        case 'colleges':
          if (isset($param[1]) && $param[1] === 'programs') {
            // GET /colleges/programs?college_id=X
            echo encryptData($colleges->getProgramsByCollege($dt));
          } elseif (isset($param[1]) && $param[1] !== '') {
            $dt = $dt ?? new stdClass();
            $dt->college_id = $param[1];
            echo encryptData($colleges->getCollegeById($dt));
          } else {
            echo encryptData($colleges->getColleges());
          }
          break;

        case 'programs':
          if (isset($param[1]) && $param[1] !== '') {
            $dt = $dt ?? new stdClass();
            $dt->program_id = $param[1];
            echo encryptData($colleges->getProgramById($dt));
          } else {
            echo encryptData($colleges->getPrograms());
          }
          break;

        // --- Reports ---
        case 'reports':
          switch ($param[1] ?? '') {
            case 'enrollments':
              echo encryptData($reports->getEnrollmentReport());
              break;
            case 'course-popularity':
              echo encryptData($reports->getCoursePopularity());
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        // --- Existing: Login / Change Password / Students ---
        case 'login':
          echo encryptData($auth->login());
          break;

        case 'changepassword':
          echo encryptData($auth->changePassword($dt));
          break;
      
        case 'students':
          echo encryptData($students->getStudents());
          break;

        case 'decryptdata':
          echo encryptData($dt);
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
          echo encryptData($courses->createCourse($dt));
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
          echo encryptData($students->insertStudent($dt));
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
              echo encryptData($users->updateUserProfile($dt));
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
          echo encryptData($courses->updateCourse($dt));
          break;

        case 'students':
          echo encryptData($students->updateStudent($dt));
          break;
      
        default:
          http_response_code(404);
          break;
      }
      break;

    case 'DELETE':
      switch ($param[0]) {
        case 'courses':
          echo encryptData($courses->deleteCourse($dt));
          break;

        // --- Delete Profile Entries ---
        case 'profile':
          switch ($param[1] ?? '') {
            case 'emergency':
              echo encryptData($profile->deleteEmergencyContact($dt));
              break;
            case 'family':
              echo encryptData($profile->deleteFamilyMember($dt));
              break;
            case 'academic':
              echo encryptData($profile->deleteAcademicRecord($dt));
              break;
            default:
              http_response_code(404);
              break;
          }
          break;

        case 'students':
          echo encryptData($students->archiveStudent($dt));
          break;

        case 'deletestudent':
          echo encryptData($students->deleteStudent($dt));
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