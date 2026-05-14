<?php
class Courses {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function createCourse($dt) {
    $values = [$dt->code, $dt->name, $dt->description, $dt->units, $dt->max_students];
    return execQuery("CALL createCourse(?, ?, ?, ?, ?)", $values, $this->pdo);
  }

  public function getCourses() {
    return execQuery("CALL getCourses()", null, $this->pdo);
  }

  public function getCourseById($dt) {
    $values = [$dt->course_id];
    return execQuery("CALL getCourseById(?)", $values, $this->pdo);
  }

  public function updateCourse($dt) {
    $values = [$dt->course_id, $dt->code, $dt->name, $dt->description, $dt->units, $dt->max_students];
    return execQuery("CALL updateCourse(?, ?, ?, ?, ?, ?)", $values, $this->pdo);
  }
}
