<?php
class Users {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function getUserProfile($dt) {
    $values = [$dt->studnum];
    $res = execQuery("CALL getUserProfile(?)", $values, $this->pdo);
    if (count($res) > 0) {
      return encryptData($res[0]);
    }
    http_response_code(404);
    return array("msg" => "Profile not found");
  }

  public function updateUserProfile($dt) {
    $values = [$dt->studnum, $dt->fname, $dt->mname, $dt->lname, $dt->extname, $dt->dob, $dt->sex];
    $res = execQuery("CALL updateUserProfile(?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      return array("msg" => "Profile updated successfully", "data" => $res[0]);
    }
    http_response_code(400);
    return array("msg" => "Profile update failed");
  }
}
