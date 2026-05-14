<?php
class Reports {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getEnrollmentReport() {
    return execQuery("CALL getEnrollmentReport()", null, $this->pdo);
  }

  public function getCoursePopularity() {
    return execQuery("CALL getCoursePopularity()", null, $this->pdo);
  }
}
