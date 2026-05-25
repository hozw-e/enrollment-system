<?php
class Profile {
  private $pdo;

  // Fields encrypted in tbl_information (personal data)
  private $personalEncryptedFields = ['fld_dob', 'fld_sex'];

  // Fields encrypted in emergency contacts
  private $emergencyEncryptedFields = ['fld_phone', 'fld_email', 'fld_address'];

  // Fields encrypted in family background
  private $familyEncryptedFields = ['fld_contact_number', 'fld_email', 'fld_address'];

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  // ─── PERSONAL INFO ───

  public function getPersonalInfo($studnum) {
    $validation = validateStudnum($studnum);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    // Use stored procedure for base personal info
    $res = execQuery("CALL getFullProfile(?)", [$studnum], $this->pdo);
    if (count($res) === 0) {
      return null;
    }

    $result = decryptFields($res[0], $this->personalEncryptedFields);

    // Look up college and program from bscs3a_admin
    try {
      $infoStmt = $this->pdo->prepare("SELECT fld_college_id, fld_program_id FROM bscs3a_students.tbl_information WHERE fld_studnum = ?");
      $infoStmt->execute([$studnum]);
      $info = $infoStmt->fetch();
      $infoStmt->closeCursor();

      if ($info && $info['fld_college_id']) {
        $cStmt = $this->pdo->prepare("SELECT fld_college_code, fld_college_name FROM bscs3a_admin.tbl_college WHERE fld_college_id = ?");
        $cStmt->execute([$info['fld_college_id']]);
        $college = $cStmt->fetch();
        $cStmt->closeCursor();
        $result['fld_college_code'] = $college ? $college['fld_college_code'] : null;
        $result['fld_college_name'] = $college ? $college['fld_college_name'] : null;
      } else {
        $result['fld_college_code'] = null;
        $result['fld_college_name'] = null;
      }

      if ($info && $info['fld_program_id']) {
        $pStmt = $this->pdo->prepare("SELECT fld_program_code, fld_program_name FROM bscs3a_admin.tbl_program WHERE fld_program_id = ?");
        $pStmt->execute([$info['fld_program_id']]);
        $program = $pStmt->fetch();
        $pStmt->closeCursor();
        $result['fld_program_code'] = $program ? $program['fld_program_code'] : null;
        $result['fld_program_name'] = $program ? $program['fld_program_name'] : null;
      } else {
        $result['fld_program_code'] = null;
        $result['fld_program_name'] = null;
      }
    } catch (\PDOException $e) {
      error_log("Profile::getPersonalInfo college/program lookup failed: " . $e->getMessage());
      $result['fld_college_code'] = null;
      $result['fld_college_name'] = null;
      $result['fld_program_code'] = null;
      $result['fld_program_name'] = null;
    }

    return $result;
  }

  public function updatePersonalInfo($dt) {
    $validation = validateRequired($dt, ['studnum', 'fname', 'lname', 'dob', 'sex']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    // Encrypt sensitive fields before storing
    $encryptedDob = encryptField($dt->dob);
    $encryptedSex = encryptField($dt->sex);

    $values = [$dt->studnum, $dt->fname, $dt->mname ?? '', $dt->lname, $dt->extname ?? '', $encryptedDob, $encryptedSex];
    $res = execQuery("CALL updateUserProfile(?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      return decryptFields($res[0], $this->personalEncryptedFields);
    }
    return null;
  }

  // ─── EMERGENCY CONTACTS ───

  public function getEmergencyContacts($studnum) {
    $validation = validateStudnum($studnum);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $res = execQuery("CALL getEmergencyContacts(?)", [$studnum], $this->pdo);
    // Decrypt sensitive fields in each row
    return decryptRows($res, $this->emergencyEncryptedFields);
  }

  public function addEmergencyContact($dt) {
    $validation = validateRequired($dt, ['studnum', 'contact_name', 'relationship']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    // Encrypt sensitive fields before storing
    $encryptedPhone   = encryptField($dt->phone ?? '');
    $encryptedEmail   = encryptField($dt->email ?? '');
    $encryptedAddress = encryptField($dt->address ?? '');

    $values = [
      $dt->studnum, $dt->contact_name, $dt->relationship,
      $encryptedPhone, $encryptedEmail, $encryptedAddress,
      $dt->is_primary ?? 0
    ];
    $res = execQuery("CALL addEmergencyContact(?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      return decryptFields($res[0], $this->emergencyEncryptedFields);
    }
    return null;
  }

  public function updateEmergencyContact($dt) {
    $validation = validateRequired($dt, ['contact_id', 'studnum', 'contact_name', 'relationship']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    // Encrypt sensitive fields before storing
    $encryptedPhone   = encryptField($dt->phone ?? '');
    $encryptedEmail   = encryptField($dt->email ?? '');
    $encryptedAddress = encryptField($dt->address ?? '');

    $values = [
      $dt->contact_id, $dt->studnum, $dt->contact_name, $dt->relationship,
      $encryptedPhone, $encryptedEmail, $encryptedAddress,
      $dt->is_primary ?? 0
    ];
    $res = execQuery("CALL updateEmergencyContact(?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      return decryptFields($res[0], $this->emergencyEncryptedFields);
    }
    return null;
  }

  public function deleteEmergencyContact($dt) {
    $validation = validateRequired($dt, ['contact_id', 'studnum']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $res = execQuery("CALL deleteEmergencyContact(?, ?)", [$dt->contact_id, $dt->studnum], $this->pdo);
    return array("msg" => "Contact deleted");
  }

  // ─── FAMILY BACKGROUND ───

  public function getFamilyBackground($studnum) {
    $validation = validateStudnum($studnum);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $res = execQuery("CALL getFamilyBackground(?)", [$studnum], $this->pdo);
    // Decrypt sensitive fields in each row
    return decryptRows($res, $this->familyEncryptedFields);
  }

  public function addFamilyMember($dt) {
    $validation = validateRequired($dt, ['studnum', 'member_type', 'full_name']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    // Encrypt sensitive fields before storing
    $encryptedContact = encryptField($dt->contact_number ?? '');
    $encryptedEmail   = encryptField($dt->email ?? '');
    $encryptedAddress = encryptField($dt->address ?? '');

    $values = [
      $dt->studnum, $dt->member_type, $dt->full_name,
      $dt->occupation ?? '', $encryptedContact,
      $encryptedEmail, $encryptedAddress, $dt->is_living ?? 1
    ];
    $res = execQuery("CALL addFamilyMember(?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      return decryptFields($res[0], $this->familyEncryptedFields);
    }
    return null;
  }

  public function updateFamilyMember($dt) {
    $validation = validateRequired($dt, ['family_id', 'studnum', 'member_type', 'full_name']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    // Encrypt sensitive fields before storing
    $encryptedContact = encryptField($dt->contact_number ?? '');
    $encryptedEmail   = encryptField($dt->email ?? '');
    $encryptedAddress = encryptField($dt->address ?? '');

    $values = [
      $dt->family_id, $dt->studnum, $dt->member_type, $dt->full_name,
      $dt->occupation ?? '', $encryptedContact,
      $encryptedEmail, $encryptedAddress, $dt->is_living ?? 1
    ];
    $res = execQuery("CALL updateFamilyMember(?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      return decryptFields($res[0], $this->familyEncryptedFields);
    }
    return null;
  }

  public function deleteFamilyMember($dt) {
    $validation = validateRequired($dt, ['family_id', 'studnum']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $res = execQuery("CALL deleteFamilyMember(?, ?)", [$dt->family_id, $dt->studnum], $this->pdo);
    return array("msg" => "Family member deleted");
  }

  // ─── ACADEMIC BACKGROUND ───

  public function getAcademicBackground($studnum) {
    $validation = validateStudnum($studnum);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    return execQuery("CALL getAcademicBackground(?)", [$studnum], $this->pdo);
  }

  public function addAcademicRecord($dt) {
    $validation = validateRequired($dt, ['studnum', 'level', 'school_name']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $values = [
      $dt->studnum, $dt->level, $dt->school_name,
      $dt->school_address ?? '', $dt->year_started ?? null,
      $dt->year_ended ?? null, $dt->degree_program ?? '',
      $dt->honors ?? ''
    ];
    $res = execQuery("CALL addAcademicRecord(?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function updateAcademicRecord($dt) {
    $validation = validateRequired($dt, ['academic_id', 'studnum', 'level', 'school_name']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $values = [
      $dt->academic_id, $dt->studnum, $dt->level, $dt->school_name,
      $dt->school_address ?? '', $dt->year_started ?? null,
      $dt->year_ended ?? null, $dt->degree_program ?? '',
      $dt->honors ?? ''
    ];
    $res = execQuery("CALL updateAcademicRecord(?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function deleteAcademicRecord($dt) {
    $validation = validateRequired($dt, ['academic_id', 'studnum']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $res = execQuery("CALL deleteAcademicRecord(?, ?)", [$dt->academic_id, $dt->studnum], $this->pdo);
    return array("msg" => "Academic record deleted");
  }

  // ─── FULL PROFILE (all sections) ───

  public function getFullProfile($studnum) {
    $personal = $this->getPersonalInfo($studnum);
    $emergency = $this->getEmergencyContacts($studnum);
    $family = $this->getFamilyBackground($studnum);
    $academic = $this->getAcademicBackground($studnum);

    return array(
      "personal" => $personal,
      "emergency_contacts" => $emergency,
      "family_background" => $family,
      "academic_background" => $academic
    );
  }
}
