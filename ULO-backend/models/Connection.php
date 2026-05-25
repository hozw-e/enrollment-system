<?php

define("SERVER", $_ENV['SERVER01']);
define("DBASE", $_ENV['DATABASE']);
define("USER", $_ENV['USER']);
define("PWORD", $_ENV['PWORD']);
define("CHARSET", $_ENV['CHARSET']);
define("SECRET_KEY", $_ENV['SECRET']);
define("DB_SECRET_KEY", $_ENV['DB_SECRET']);
define("LEGACY_KEY", $_ENV['LEGACY_SECRET'] ?? '');
define("ALGO", $_ENV['ALGO']);

class Connection {
  static $conn = false;
  
  public function connect() {
    $cnString = "mysql:host=" . SERVER . "; dbname=" . DBASE . "; charset=" . CHARSET;
    $options = [
      \PDO::ATTR_ERRMODE=>\PDO::ERRMODE_EXCEPTION,
      \PDO::ATTR_DEFAULT_FETCH_MODE=>\PDO::FETCH_ASSOC,
      \PDO::ATTR_EMULATE_PREPARES=>false,
      \PDO::ATTR_STRINGIFY_FETCHES=>false,
      \PDO::ATTR_PERSISTENT=>false,
      \PDO::ATTR_TIMEOUT=>5,
    ];

    try {
      static::$conn = new \PDO($cnString, USER, PWORD, $options);
    } catch (\PDOException $er) {
      echo "Connection Error: ".$er->getMessage();
      http_response_code(403);
    } 
    return static::$conn;
  }
}