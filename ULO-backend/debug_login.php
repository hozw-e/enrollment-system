<?php
require_once __DIR__ . "/vendor/autoload.php";

$env = Dotenv\Dotenv::createImmutable(__DIR__ . "/config/");
$env->load();

require_once __DIR__ . "/models/Connection.php";
require_once __DIR__ . "/functions.php";

$db = new Connection();
$pdo = $db->connect();

if (!$pdo) {
    echo "Database connection failed!\n";
    exit(1);
}

// Check if admin001 exists
$stmt = $pdo->prepare("SELECT * FROM bscs3a_accounts.tbl_accounts WHERE fld_username = ?");
$stmt->execute(['admin001']);
$user = $stmt->fetch();

if (!$user) {
    echo "User 'admin001' NOT FOUND in database.\n";
    echo "\nListing all users:\n";
    $stmt = $pdo->query("SELECT fld_studnum, fld_username, fld_role, fld_hasaccess FROM bscs3a_accounts.tbl_accounts");
    $all = $stmt->fetchAll();
    if (empty($all)) {
        echo "  (no users in database)\n";
    } else {
        foreach ($all as $row) {
            echo "  - {$row['fld_username']} (studnum: {$row['fld_studnum']}, role: {$row['fld_role']}, access: {$row['fld_hasaccess']})\n";
        }
    }
} else {
    echo "User found: {$user['fld_username']}\n";
    echo "Studnum: {$user['fld_studnum']}\n";
    echo "Role: {$user['fld_role']}\n";
    echo "Has access: {$user['fld_hasaccess']}\n";
    echo "Stored hash: {$user['fld_pword']}\n";
    echo "\n";
    
    // Test password
    $testPassword = 'admin123';
    $storedHash = $user['fld_pword'];
    
    echo "Testing password '$testPassword':\n";
    echo "  crypt() result: " . crypt($testPassword, $storedHash) . "\n";
    echo "  Stored hash:    " . $storedHash . "\n";
    echo "  Match: " . (checkPassword($testPassword, $storedHash) ? "YES" : "NO") . "\n";
    echo "\n";
    
    // Generate a fresh hash for comparison
    $freshHash = generatePassword($testPassword);
    echo "Fresh hash for '$testPassword': $freshHash\n";
    echo "  Verify fresh: " . (checkPassword($testPassword, $freshHash) ? "YES" : "NO") . "\n";
}
