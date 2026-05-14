<?php
class Auth {
  private $pdo = '';

  public function __construct(\PDO $pdo) {
    $this->pdo = $pdo;
  }

  public function register($dt) {
    // Check if username already exists
    $existing = execQuery("CALL loginAccount(?)", [$dt->username], $this->pdo);
    if (count($existing) > 0) {
      http_response_code(409);
      return json_encode(array("msg" => "Username already exists"));
    }

    $hashedPassword = generatePassword($dt->password);
    $values = [
      $dt->studnum,
      $dt->username,
      $hashedPassword,
      $dt->fname,
      $dt->mname ?? '',
      $dt->lname,
      $dt->extname ?? '',
      $dt->dob,
      $dt->sex
    ];
    $res = execQuery("CALL registerAccount(?, ?, ?, ?, ?, ?, ?, ?, ?)", $values, $this->pdo);
    if (count($res) > 0) {
      http_response_code(201);
      return json_encode(array("msg" => "Registration successful", "data" => $res[0]));
    }
    http_response_code(400);
    return json_encode(array("msg" => "Registration failed"));
  }

  public function login($dt) {
    error_log("LOGIN START - username: " . $dt->username);
    
    // Use direct query instead of stored procedure to avoid PDO result set issues
    $sql = "SELECT a.fld_studnum, a.fld_username, a.fld_pword, a.fld_role, a.fld_hasaccess,
                   i.fld_fname, i.fld_lname
            FROM bscs3a_accounts.tbl_accounts a
            LEFT JOIN bscs3a_students.tbl_information i ON a.fld_studnum = i.fld_studnum
            WHERE a.fld_username = ?";
    
    error_log("LOGIN - about to query DB");
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([$dt->username]);
    $res = $stmt->fetchAll();
    error_log("LOGIN - query result count: " . count($res));
    
    if (count($res) > 0) {
      // Check if user has access
      if ($res[0]['fld_hasaccess'] === null || $res[0]['fld_hasaccess'] === '0') {
        http_response_code(403);
        return json_encode(array("msg" => "Account access denied"));
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
        return json_encode($userData);
      }
    }
    http_response_code(401);
    return json_encode(array("msg" => "Invalid credentials"));
  }

  public function changePassword($d) {
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