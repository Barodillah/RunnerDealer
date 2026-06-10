<?php
require_once 'config.php';

// Ambil input JSON
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid JSON Input"]);
    exit();
}

if (!$conn) {
    http_response_code(500);
    echo json_encode(["message" => "Database Connection Error"]);
    exit();
}

$username = isset($data->username) ? $data->username : null;
$email = isset($data->email) ? $data->email : null;
$telp = isset($data->telp) ? $data->telp : null;

$foundCustomer = null;

$queries = [
    "SELECT * FROM customers WHERE username = ? LIMIT 1" => $username,
    "SELECT * FROM customers WHERE email = ? LIMIT 1" => $email,
    "SELECT * FROM customers WHERE telp = ? LIMIT 1" => $telp,
];

foreach ($queries as $sql => $val) {
    if (!empty($val)) {
        $stmtCheck = $conn->prepare($sql);
        $stmtCheck->execute([$val]);
        if ($stmtCheck->rowCount() > 0) {
            $foundCustomer = $stmtCheck->fetch(PDO::FETCH_ASSOC);
            break; // Keluar dari loop jika sudah ketemu
        }
    }
}

if ($foundCustomer) {
    http_response_code(200);
    echo json_encode([
        "found" => true,
        "data" => $foundCustomer
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        "found" => false
    ]);
}
?>
