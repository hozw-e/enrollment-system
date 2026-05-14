<?php

function execQuery($sql, $values, $pdo) {
  $data = [];
  $stmt = $pdo->prepare($sql);
  try {
    $stmt->execute($values);
    // For stored procedures (CALL), we need to handle multiple result sets
    // fetchAll() may return empty on the first try with emulated prepares disabled
    $res = $stmt->fetchAll();
    if ($res) {
      $data = $res;
    } else {
      // Try next result set (MySQL stored procedures return multiple result sets)
      if ($stmt->nextRowset()) {
        $res = $stmt->fetchAll();
        if ($res) {
          $data = $res;
        }
      }
    }
    $stmt->closeCursor();
  } catch (\PDOException $er) {
    error_log("execQuery error: " . $er->getMessage());
    http_response_code(400);
  }
  return $data;
}


// JWT using Firebase/JWT library
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function generateJWT() {
  $key = 'example_key_of_sufficient_lengthexample_key_of_sufficient_length';
  $exp = time() + (60 * 60 * 24); // expires in 24 hours from now
  $p = [
    "ito" => "John Cruise",
    "iby" => "BSCS3A",
    "ie"  => "bscs3a@test.com",
    "exp" => $exp
  ];
  return JWT::encode($p, $key, "HS512");
}
// ./JWT using Firebase/JWT library


// Manual JWT
function generateToken() {
  $header    = generateHeader();
  $payload   = generatePayload();
  $signature = hash_hmac('sha256', "$header.$payload", "a-string-secret-at-least-256-bit");
  $signature = base64_encode($signature);
  $signature = str_replace(["+", "/", "="], ["-", "_", ""], $signature);
  return "$header.$payload.$signature";
}

function generateHeader() {
  $h = [
    "typ" => "JWT",
    "alg" => "HS256",
    "dev" => "BSCS3a"
  ];
  $h = json_encode($h);
  $h = base64_encode($h);
  $h = str_replace(["+", "/", "="], ["-", "_", ""], $h);
  return $h;
}

function generatePayload() {
  $exp = time() + (60 * 60 * 24); // expires in 24 hours from now
  $p = [
    "ito" => "John Cruise",
    "iby" => "BSCS3a",
    "ie"  => "bscs3a@test.com",
    "exp" => $exp
  ];
  $p = json_encode($p);
  $p = base64_encode($p);
  $p = str_replace(["+", "/", "="], ["-", "_", ""], $p);
  return $p;
}
// ./Manual JWT


// Hash Password
function generatePassword($pword) {
  $hashFormat = "$2y$10$";
  $saltLength = 22;
  $salt = generateSalt($saltLength);
  return crypt($pword, $hashFormat . $salt);
}

function generateSalt($sl) {
  $urs = md5(uniqid(mt_rand(), true));
  $urs = base64_encode($urs);
  $urs = str_replace("+", ".", $urs);
  return substr($urs, 0, $sl);
}

function checkPassword($pwPlain, $pwHash) {
  return crypt($pwPlain, $pwHash) === $pwHash;
}
// ./Hash Password


// AES-256-GCM
function encryptData($dt) {
  $key      = SECRET_KEY;
  $algo     = ALGO;
  $plainText = json_encode($dt);
  $ivLength  = 12;
  $iv        = openssl_random_pseudo_bytes($ivLength);
  $tag       = '';

  $cipherText = openssl_encrypt($plainText, $algo, $key, OPENSSL_RAW_DATA, $iv, $tag);

  $output = json_encode([
    "payload" => base64_encode(json_encode([
      "data" => base64_encode($cipherText),
      "iv"   => base64_encode($iv),
      "tag"  => base64_encode($tag)
    ]))
  ]);

  return $output;
}

function decryptData($dt) {
  $key  = SECRET_KEY;
  $algo = ALGO;

  $parsed = is_string($dt) ? json_decode($dt) : $dt;

  if (!isset($parsed->payload)) {
    throw new Exception("Invalid Format: missing payload");
  }

  $decodedB64 = base64_decode($parsed->payload);
  $inner      = json_decode($decodedB64, true);

  if (!isset($inner['data'], $inner['tag'], $inner['iv'])) {
    throw new Exception("Invalid Format: missing data/tag/iv");
  }

  $cipherText = base64_decode($inner['data']);
  $iv         = base64_decode($inner['iv']);
  $tag        = base64_decode($inner['tag']);

  $plainText = openssl_decrypt($cipherText, $algo, $key, OPENSSL_RAW_DATA, $iv, $tag);

  if ($plainText === false) {
    throw new Exception("Decryption failed");
  }

  return $plainText;
}
// ./AES-256-GCM