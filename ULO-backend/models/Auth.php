<?php
class Auth {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function register($dt) {
    // Input validation
    $validation = validateRequired($dt, ['studnum', 'username', 'password', 'fname', 'lname', 'dob', 'sex']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $lenCheck = validateLength($dt->username, 'Username', 3, 50);
    if ($lenCheck) {
      http_response_code(400);
      return $lenCheck;
    }

    $lenCheck = validateLength($dt->password, 'Password', 6, 255);
    if ($lenCheck) {
      http_response_code(400);
      return $lenCheck;
    }

    $studnumCheck = validateStudnum($dt->studnum);
    if ($studnumCheck) {
      http_response_code(400);
      return $studnumCheck;
    }

    // Check if username already exists
    $existing = execQuery("CALL loginAccount(?)", [$dt->username], $this->pdo);
    if (count($existing) > 0) {
      http_response_code(409);
      return array("msg" => "Username already exists");
    }

    // Hash password using password_hash()
    $hashedPassword = generatePassword($dt->password);

    // Encrypt sensitive personal data before storing
    $encryptedDob = encryptField($dt->dob);
    $encryptedSex = encryptField($dt->sex);

    $values = [
      $dt->studnum,
      $dt->username,
      $hashedPassword,
      $dt->fname,
      $dt->mname ?? '',
      $dt->lname,
      $dt->extname ?? '',
      $encryptedDob,
      $encryptedSex
    ];
    $res = execQuery("CALL registerAccount(?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      http_response_code(201);
      return array("msg" => "Registration successful", "data" => $res[0]);
    }
    http_response_code(400);
    return array("msg" => "Registration failed");
  }

  public function login($dt) {
    // Input validation
    $validation = validateRequired($dt, ['username', 'password']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $res = execQuery("CALL loginAccount(?)", [$dt->username], $this->pdo);
    
    if (count($res) > 0) {
      // Check if user has access
      if ($res[0]['fld_hasaccess'] === null || $res[0]['fld_hasaccess'] === '0') {
        http_response_code(403);
        return array("msg" => "Account access denied");
      }
      if (checkPassword($dt->password, $res[0]['fld_pword'])) {
        http_response_code(200);
        $userData = array(
          "token" => generateJWT(),
          "studnum" => $res[0]['fld_studnum'],
          "username" => $res[0]['fld_username'],
          "role" => $res[0]['fld_role'],
          "fname" => $res[0]['fld_fname'] ?? '',
          "lname" => $res[0]['fld_lname'] ?? ''
        );
        return $userData;
      }
    }
    http_response_code(401);
    return array("msg" => "Invalid credentials");
  }

  public function changePassword($d) {
    // Input validation
    $validation = validateRequired($d, ['username', 'password', 'newpword']);
    if ($validation) {
      http_response_code(400);
      return $validation;
    }

    $lenCheck = validateLength($d->newpword, 'New password', 6, 255);
    if ($lenCheck) {
      http_response_code(400);
      return $lenCheck;
    }

    $un = $d->username;
    $pw = $d->password;
    $np = generatePassword($d->newpword);
    $values = [$un];
    $res = execQuery("CALL loginAccount(?)", $values, $this->pdo);
    if (count($res) > 0 && checkPassword($pw, $res[0]['fld_pword'])) {
      $values = [$un, $np];
      $res = execQuery("CALL updatePassword(?, ?)", $values, $this->pdo);
      http_response_code(200);
      return array("msg" => "Password change successful");
    }
    http_response_code(401);
    return array("msg" => "No access privilege");
  }
}
