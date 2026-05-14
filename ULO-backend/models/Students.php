<?php
class Students {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getStudents() {
    return execQuery("CALL getStudents()", null, $this->pdo);
  }

  public function insertStudent($dt) {
    $values = [$dt->id, $dt->fname, $dt->lname, $dt->dob];
    return execQuery("CALL insertStudent(?, ?, ?, ?)", $values, $this->pdo);
  }

  public function updateStudent($dt) {
    $values = [$dt->id, $dt->fname, $dt->lname, $dt->dob];
    return execQuery("CALL updateStudent(?, ?, ?, ?)", $values, $this->pdo);
  }

  public function deleteStudent($dt) {
    $values = [$dt->id];
    return execQuery("CALL deleteStudent(?)", $values, $this->pdo);
  }

  public function archiveStudent($dt) {
    $values = [$dt->id, $dt->isdeleted];
    return execQuery("CALL archiveStudent(?, ?)", $values, $this->pdo);
  }
}