<?php
require_once __DIR__ . "/vendor/autoload.php";

$env = Dotenv\Dotenv::createImmutable(__DIR__ . "/config/");
$env->load();

require_once __DIR__ . "/models/Connection.php";
require_once __DIR__ . "/functions.php";

// Simulate receiving encrypted data from frontend
$input = file_get_contents("php://input");

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (empty($input)) {
    echo json_encode(["error" => "No input received"]);
    exit();
}

echo json_encode([
    "raw_input_length" => strlen($input),
    "raw_input_preview" => substr($input, 0, 200),
]);

try {
    $decrypted = decryptData($input);
    $dt = json_decode($decrypted);
    
    echo "\n";
    echo json_encode([
        "decrypted_string" => $decrypted,
        "decoded_object" => $dt,
        "username" => $dt->username ?? "NOT FOUND",
        "password" => $dt->password ?? "NOT FOUND",
    ]);
} catch (Exception $e) {
    echo "\n";
    echo json_encode([
        "error" => $e->getMessage(),
    ]);
}
