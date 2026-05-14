<?php
class Admin {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getAllStudents() {
    return execQuery("CALL getAllStudents()", null, $this->pdo);
  }

  public function getAllCourses() {
    return execQuery("CALL getAllCoursesAdmin()", null, $this->pdo);
  }
}
