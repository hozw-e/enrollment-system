<?php
class Users {
  private $pdo = '';

  private $personalEncryptedFields = ['fld_dob', 'fld_sex'];

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getUserProfile($dt) {
    $validation = validateRequired($dt, ['studnum']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $values = [$dt->studnum];
    $res = execQuery("CALL getUserProfile(?)", $values, $this->pdo);
    if (count($res) > 0) {
      // Decrypt sensitive fields before returning
      $decrypted = decryptFields($res[0], $this->personalEncryptedFields);
      return $decrypted;
    }
    http_response_code(404);
    return array("msg" => "Profile not found");
  }

  public function updateUserProfile($dt) {
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
      $decrypted = decryptFields($res[0], $this->personalEncryptedFields);
      return array("msg" => "Profile updated successfully", "data" => $decrypted);
    }
    http_response_code(400);
    return array("msg" => "Profile update failed");
  }
}
