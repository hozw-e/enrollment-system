<?php
class Enrollments {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function enrollStudent($dt) {
    $validation = validateRequired($dt, ['studnum', 'course_id']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    if (!is_numeric($dt->course_id) || $dt->course_id <= 0) {
      http_response_code(400);
      return array("error" => "Invalid course ID");
    }

    $values = [$dt->studnum, $dt->course_id];
    return execQuery("CALL enrollStudent(?, ?)", $values, $this->pdo);
  }

  public function getEnrollmentsByStudent($dt) {
    $validation = validateRequired($dt, ['studnum']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $values = [$dt->studnum];
    return execQuery("CALL getEnrollmentsByStudent(?)", $values, $this->pdo);
  }
}
