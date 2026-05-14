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

  public function deleteCourse($dt) {
    $res = execQuery("CALL deleteCourse(?)", [$dt->course_id], $this->pdo);
    if (count($res) > 0 && $res[0]['affected'] > 0) {
      return array("msg" => "Course deleted successfully");
    }
    http_response_code(404);
    return array("msg" => "Course not found");
  }
}
