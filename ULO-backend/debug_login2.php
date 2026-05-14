<?php
require_once __DIR__ . "/vendor/autoload.php";

$env = Dotenv\Dotenv::createImmutable(__DIR__ . "/config/");
$env->load();

require_once __DIR__ . "/models/Connection.php";
require_once __DIR__ . "/functions.php";

$db = new Connection();
$pdo = $db->connect();

echo "Testing execQuery with loginAccount stored procedure:\n\n";

// This is exactly what Auth::login() does
$values = ['admin001'];
$res = execQuery("CALL loginAccount(?)", $values, $pdo);

echo "Result count: " . count($res) . "\n";
echo "Result: " . print_r($res, true) . "\n";

if (count($res) > 0) {
    echo "\nfld_hasaccess: " . var_export($res[0]['fld_hasaccess'], true) . "\n";
    echo "fld_pword: " . $res[0]['fld_pword'] . "\n";
    echo "Password check: " . (checkPassword('admin123', $res[0]['fld_pword']) ? "PASS" : "FAIL") . "\n";
} else {
    echo "\nNo results returned! The stored procedure returned empty.\n";
    echo "Trying direct query instead:\n";
    $stmt = $pdo->prepare("SELECT * FROM bscs3a_accounts.tbl_accounts WHERE fld_username = ?");
    $stmt->execute(['admin001']);
    $direct = $stmt->fetchAll();
    echo "Direct query result: " . print_r($direct, true) . "\n";
}
