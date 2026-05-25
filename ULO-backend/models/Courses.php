<?php
class Courses {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function createCourse($dt) {
    $validation = validateRequired($dt, ['code', 'name', 'units', 'max_students']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    if (!is_numeric($dt->units) || $dt->units <= 0) {
      http_response_code(400);
      return array("error" => "Units must be a positive number");
    }

    if (!is_numeric($dt->max_students) || $dt->max_students <= 0) {
      http_response_code(400);
      return array("error" => "Max students must be a positive number");
    }

    $values = [$dt->code, $dt->name, $dt->description ?? '', $dt->units, $dt->max_students];
    return execQuery("CALL createCourse(?, ?, ?, ?, ?)", $values, $this->pdo);
  }

  public function getCourses() {
    return execQuery("CALL getCourses()", null, $this->pdo);
  }

  public function getCourseById($dt) {
    if (!isset($dt->course_id) || !is_numeric($dt->course_id)) {
      http_response_code(400);
      return array("error" => "Invalid course ID");
    }

    $values = [$dt->course_id];
    return execQuery("CALL getCourseById(?)", $values, $this->pdo);
  }

  public function updateCourse($dt) {
    $validation = validateRequired($dt, ['course_id', 'code', 'name', 'units', 'max_students']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $values = [$dt->course_id, $dt->code, $dt->name, $dt->description ?? '', $dt->units, $dt->max_students];
    return execQuery("CALL updateCourse(?, ?, ?, ?, ?, ?)", $values, $this->pdo);
  }

  public function deleteCourse($dt) {
    $validation = validateRequired($dt, ['course_id']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $courseId = intval($dt->course_id);
    if ($courseId <= 0) {
      http_response_code(400);
      return array("error" => "Invalid course ID");
    }

    try {
      // Disable foreign key checks to ensure deletion works
      $this->pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

      // Delete related enrollments first
      $stmt = $this->pdo->prepare("DELETE FROM tbl_enrollments WHERE fld_course_id = ?");
      $stmt->execute([$courseId]);
      $stmt->closeCursor();

      // Delete the course
      $stmt = $this->pdo->prepare("DELETE FROM tbl_courses WHERE fld_course_id = ?");
      $stmt->execute([$courseId]);
      $affected = $stmt->rowCount();
      $stmt->closeCursor();

      // Re-enable foreign key checks
      $this->pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

      if ($affected > 0) {
        return array("msg" => "Course deleted successfully");
      }
      http_response_code(404);
      return array("msg" => "Course not found");
    } catch (\PDOException $e) {
      $this->pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
      error_log("deleteCourse error: " . $e->getMessage());
      http_response_code(500);
      return array("error" => "Failed to delete course: " . $e->getMessage());
    }
  }
}
