<?php
class Profile {
  private $pdo;

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  // ─── PERSONAL INFO ───

  public function getPersonalInfo($studnum) {
    $res = execQuery("CALL getFullProfile(?)", [$studnum], $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function updatePersonalInfo($dt) {
    $values = [$dt->studnum, $dt->fname, $dt->mname ?? '', $dt->lname, $dt->extname ?? '', $dt->dob, $dt->sex];
    $res = execQuery("CALL updateUserProfile(?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  // ─── EMERGENCY CONTACTS ───

  public function getEmergencyContacts($studnum) {
    return execQuery("CALL getEmergencyContacts(?)", [$studnum], $this->pdo);
  }

  public function addEmergencyContact($dt) {
    $values = [
      $dt->studnum, $dt->contact_name, $dt->relationship,
      $dt->phone ?? '', $dt->email ?? '', $dt->address ?? '',
      $dt->is_primary ?? 0
    ];
    $res = execQuery("CALL addEmergencyContact(?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function updateEmergencyContact($dt) {
    $values = [
      $dt->contact_id, $dt->studnum, $dt->contact_name, $dt->relationship,
      $dt->phone ?? '', $dt->email ?? '', $dt->address ?? '',
      $dt->is_primary ?? 0
    ];
    $res = execQuery("CALL updateEmergencyContact(?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function deleteEmergencyContact($dt) {
    $res = execQuery("CALL deleteEmergencyContact(?, ?)", [$dt->contact_id, $dt->studnum], $this->pdo);
    return array("msg" => "Contact deleted");
  }

  // ─── FAMILY BACKGROUND ───

  public function getFamilyBackground($studnum) {
    return execQuery("CALL getFamilyBackground(?)", [$studnum], $this->pdo);
  }

  public function addFamilyMember($dt) {
    $values = [
      $dt->studnum, $dt->member_type, $dt->full_name,
      $dt->occupation ?? '', $dt->contact_number ?? '',
      $dt->email ?? '', $dt->address ?? '', $dt->is_living ?? 1
    ];
    $res = execQuery("CALL addFamilyMember(?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function updateFamilyMember($dt) {
    $values = [
      $dt->family_id, $dt->studnum, $dt->member_type, $dt->full_name,
      $dt->occupation ?? '', $dt->contact_number ?? '',
      $dt->email ?? '', $dt->address ?? '', $dt->is_living ?? 1
    ];
    $res = execQuery("CALL updateFamilyMember(?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    return count($res) > 0 ? $res[0] : null;
  }

  public function deleteFamilyMember($dt) {
    $res = execQuery("CALL deleteFamilyMember(?, ?)", [$dt->family_id, $dt->studnum], $this->pdo);
    return array("msg" => "Family member deleted");
  }

  // ─── ACADEMIC BACKGROUND ───

  public function getAcademicBackground($studnum) {
    return execQuery("CALL getAcademicBackground(?)", [$studnum], $this->pdo);
  }

  public function addAcademicRecord($dt) {
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
