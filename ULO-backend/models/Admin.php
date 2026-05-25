<?php
class Admin {
  private $pdo = '';

  private $personalEncryptedFields = ['fld_dob', 'fld_sex'];

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getAllStudents() {
    // Use stored procedure to get base student data
    $results = execQuery("CALL getAllStudents()", null, $this->pdo);
    
    if (!$results || count($results) === 0) {
      return [];
    }

    // Decrypt personal fields
    $results = decryptRows($results, $this->personalEncryptedFields);

    // Load college and program lookup maps from bscs3a_admin
    $collegeMap = [];
    $programMap = [];
    $studentInfoMap = [];

    try {
      $cStmt = $this->pdo->query("SELECT fld_college_id, fld_college_code, fld_college_name FROM bscs3a_admin.tbl_college");
      foreach ($cStmt->fetchAll() as $c) {
        $collegeMap[$c['fld_college_id']] = $c;
      }

      $pStmt = $this->pdo->query("SELECT fld_program_id, fld_program_code, fld_program_name FROM bscs3a_admin.tbl_program");
      foreach ($pStmt->fetchAll() as $p) {
        $programMap[$p['fld_program_id']] = $p;
      }

      // Batch load all student college/program IDs in one query
      $infoStmt = $this->pdo->query("SELECT fld_studnum, fld_college_id, fld_program_id FROM bscs3a_students.tbl_information");
      foreach ($infoStmt->fetchAll() as $info) {
        $studentInfoMap[$info['fld_studnum']] = $info;
      }
    } catch (\PDOException $e) {
      error_log("Admin::getAllStudents - failed to load college/program data: " . $e->getMessage());
      foreach ($results as &$row) {
        $row['fld_college_code'] = null;
        $row['fld_college_name'] = null;
        $row['fld_program_code'] = null;
        $row['fld_program_name'] = null;
      }
      unset($row);
      return $results;
    }

    // Resolve college/program for each student
    foreach ($results as &$row) {
      $row['fld_college_code'] = null;
      $row['fld_college_name'] = null;
      $row['fld_program_code'] = null;
      $row['fld_program_name'] = null;

      $info = $studentInfoMap[$row['fld_studnum']] ?? null;
      if ($info) {
        $cid = $info['fld_college_id'];
        $pid = $info['fld_program_id'];
        if ($cid && isset($collegeMap[$cid])) {
          $row['fld_college_code'] = $collegeMap[$cid]['fld_college_code'];
          $row['fld_college_name'] = $collegeMap[$cid]['fld_college_name'];
        }
        if ($pid && isset($programMap[$pid])) {
          $row['fld_program_code'] = $programMap[$pid]['fld_program_code'];
          $row['fld_program_name'] = $programMap[$pid]['fld_program_name'];
        }
      }
    }
    unset($row);

    return $results;
  }

  public function getAllCourses() {
    return execQuery("CALL getAllCoursesAdmin()", null, $this->pdo);
  }
}
