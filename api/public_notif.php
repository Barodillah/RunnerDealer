<?php
require_once 'config.php';

if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Error", "error" => $dbError]);
    exit();
}

try {
    // Query untuk mendapatkan tiket dengan status "New"
    // Mengambil informasi perusahaan (customer_company), jenis tiket (type), dan customer_id
    $sql = "SELECT t.id, t.customer_id, t.kode, t.type as jenis_tiket, c.company as perusahaan, t.created_at 
            FROM tickets t 
            LEFT JOIN customers c ON t.customer_id = c.id 
            WHERE t.status = 'New' 
            ORDER BY t.created_at DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "total_new_tickets" => count($data),
        "data" => $data
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Error", "error" => $e->getMessage()]);
}
?>
