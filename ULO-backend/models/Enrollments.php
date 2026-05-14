<?php
class Enrollments {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function enrollStudent($dt) {
    $values = [$dt->studnum, $dt->course_id];
    return execQuery("CALL enrollStudent(?, ?)", $values, $this->pdo);
  }

  public function getEnrollmentsByStudent($dt) {
    $values = [$dt->studnum];
    return execQuery("CALL getEnrollmentsByStudent(?)", $values, $this->pdo);
  }
}
