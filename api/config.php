<?php
// Pengaturan CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Dealer-Auth");

// Tangani request OPTIONS untuk preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Konfigurasi Database
$host = "153.92.15.23";
$port = "3306";
$db_name = "";
$username = "";
$password = "";

$conn = null;
$dbStatus = "ok";
$dbError = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";port=" . $port . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    $dbStatus = "error";
    $dbError = $exception->getMessage();
}
?>