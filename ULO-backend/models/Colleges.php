<?php
class Colleges {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getColleges() {
    try {
      $stmt = $this->pdo->query("SELECT * FROM bscs3a_admin.tbl_college WHERE fld_is_active = 1 ORDER BY fld_college_code");
      return $stmt->fetchAll();
    } catch (\PDOException $e) {
      // Fallback to stored procedure
      return execQuery("CALL getColleges()", null, $this->pdo);
    }
  }

  public function getCollegeById($dt) {
    if (!isset($dt->college_id) || !is_numeric($dt->college_id)) {
      http_response_code(400);
      return array("error" => "Invalid college ID");
    }
    try {
      $stmt = $this->pdo->prepare("SELECT * FROM bscs3a_admin.tbl_college WHERE fld_college_id = ?");
      $stmt->execute([$dt->college_id]);
      $result = $stmt->fetchAll();
      $stmt->closeCursor();
      return $result;
    } catch (\PDOException $e) {
      return execQuery("CALL getCollegeById(?)", [$dt->college_id], $this->pdo);
    }
  }

  public function getPrograms() {
    try {
      $stmt = $this->pdo->query("SELECT * FROM bscs3a_admin.tbl_program WHERE fld_is_active = 1 ORDER BY fld_program_code");
      return $stmt->fetchAll();
    } catch (\PDOException $e) {
      return execQuery("CALL getPrograms()", null, $this->pdo);
    }
  }

  public function getProgramsByCollege($dt) {
    if (!isset($dt->college_id) || !is_numeric($dt->college_id)) {
      http_response_code(400);
      return array("error" => "Invalid college ID");
    }
    try {
      $stmt = $this->pdo->prepare("SELECT * FROM bscs3a_admin.tbl_program WHERE fld_college_id = ? AND fld_is_active = 1 ORDER BY fld_program_code");
      $stmt->execute([$dt->college_id]);
      $result = $stmt->fetchAll();
      $stmt->closeCursor();
      return $result;
    } catch (\PDOException $e) {
      return execQuery("CALL getProgramsByCollege(?)", [$dt->college_id], $this->pdo);
    }
  }

  public function getProgramById($dt) {
    if (!isset($dt->program_id) || !is_numeric($dt->program_id)) {
      http_response_code(400);
      return array("error" => "Invalid program ID");
    }
    try {
      $stmt = $this->pdo->prepare("SELECT * FROM bscs3a_admin.tbl_program WHERE fld_program_id = ?");
      $stmt->execute([$dt->program_id]);
      $result = $stmt->fetchAll();
      $stmt->closeCursor();
      return $result;
    } catch (\PDOException $e) {
      return execQuery("CALL getProgramById(?)", [$dt->program_id], $this->pdo);
    }
  }
}
