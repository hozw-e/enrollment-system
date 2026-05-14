<?php
require_once __DIR__ . '/functions.php';

// Generate password hashes for sample data
$passwords = [
    'admin123' => 'admin001',
    'student123' => 'S2026001',
];

echo "=== Password Hashes ===\n\n";
foreach ($passwords as $password => $user) {
    $hash = generatePassword($password);
    echo "User: $user\n";
    echo "Password: $password\n";
    echo "Hash: $hash\n\n";
}

echo "\n=== SQL INSERT for admin ===\n\n";
$adminHash = generatePassword('admin123');
echo "INSERT INTO bscs3a_accounts.tbl_accounts (fld_studnum, fld_username, fld_pword, fld_role, fld_hasaccess)\n";
echo "VALUES ('ADMIN001', 'admin001', '$adminHash', 1, '1');\n\n";

$studentHash = generatePassword('student123');
echo "INSERT INTO bscs3a_accounts.tbl_accounts (fld_studnum, fld_username, fld_pword, fld_role, fld_hasaccess)\n";
echo "VALUES ('S2026001', 'S2026001', '$studentHash', 0, '1');\n";
