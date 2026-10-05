<?php
require_once 'config.php';

// Mengambil parameter rangka, bisa dari .htaccess rewrite (?rangka=xxx) 
// atau dari PATH_INFO (jika dipanggil via api/vehicles.php/xxx)
$rangka = isset($_GET['rangka']) ? $_GET['rangka'] : '';

if (empty($rangka) && isset($_SERVER['PATH_INFO'])) {
    $path = trim($_SERVER['PATH_INFO'], '/');
    if (!empty($path)) {
        $rangka = $path;
    }
}

if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Error"]);
    exit();
}

if (empty($rangka)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No rangka provided"]);
    exit();
}

try {
    // Mencari kendaraan berdasarkan rangka beserta data customer
    $sql = "SELECT v.rangka, v.status as vehicle_status, 
                   c.company, c.nama, c.username, c.telp, c.email 
            FROM vehicles v 
            LEFT JOIN customers c ON v.customer_id = c.id 
            WHERE v.rangka = ? LIMIT 1";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute([$rangka]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        // Respon persis seperti yang diharapkan oleh frontend
        echo json_encode([
            "status" => "success",
            "data" => [
                "vehicle" => [
                    "rangka" => $data['rangka'],
                    "status" => $data['vehicle_status']
                ],
                "customer" => [
                    "company" => $data['company'],
                    "nama" => $data['nama'],
                    "username" => $data['username'],
                    "telp" => $data['telp'],
                    "email" => $data['email']
                ]
            ]
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Vehicle not found"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error", "error" => $e->getMessage()]);
}
?>
