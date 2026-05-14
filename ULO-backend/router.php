<?php
/**
 * Router for PHP Built-in Server
 * 
 * Use this when running: php -S localhost:8000 router.php
 * This router emulates the .htaccess rewrite rules for development
 */

// Handle CORS preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  http_response_code(200);
  exit();
}

// Quick health check endpoint
$uri_check = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($uri_check === '/health') {
  header('Content-Type: application/json');
  header('Access-Control-Allow-Origin: *');
  echo json_encode(["status" => "ok", "time" => date('c')]);
  exit();
}

// Get the requested URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files directly
if ($uri !== '/' && is_file(__DIR__ . $uri)) {
  return false;
}

// Route everything else through main.php
require __DIR__ . '/main.php';
