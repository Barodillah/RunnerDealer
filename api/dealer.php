<?php
require_once 'config.php';

// Cek koneksi DB
if (!$conn) {
    http_response_code(500);
    echo json_encode(["message" => "Database Connection Error", "error" => $dbError]);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Simple auth check for mutations
    $authHeader = isset($_SERVER['HTTP_X_DEALER_AUTH']) ? $_SERVER['HTTP_X_DEALER_AUTH'] : '';
    if ($authHeader !== 'true' && $authHeader !== '2098') {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized access. Invalid or missing session."]);
        exit();
    }
}

// Helper function untuk pagination
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    switch ($action) {
        case 'summary':
            $stmtC = $conn->query("SELECT COUNT(id) as total FROM customers");
            $totalCustomers = $stmtC->fetchColumn();
            $stmtCStatus = $conn->query("SELECT status, COUNT(id) as count FROM customers GROUP BY status");
            $customersStatus = $stmtCStatus->fetchAll(PDO::FETCH_ASSOC);

            $stmtV = $conn->query("SELECT COUNT(id) as total FROM vehicles");
            $totalVehicles = $stmtV->fetchColumn();
            $stmtVStatus = $conn->query("SELECT status, COUNT(id) as count FROM vehicles GROUP BY status");
            $vehiclesStatus = $stmtVStatus->fetchAll(PDO::FETCH_ASSOC);

            $stmtT = $conn->query("SELECT COUNT(id) as total FROM tickets");
            $totalTickets = $stmtT->fetchColumn();
            $stmtTStatus = $conn->query("SELECT status, COUNT(id) as count FROM tickets GROUP BY status");
            $ticketsStatus = $stmtTStatus->fetchAll(PDO::FETCH_ASSOC);

            // 1. Deteksi telp atau email double
            $stmtDupEmail = $conn->query("SELECT SUM(c) FROM (SELECT COUNT(*) as c FROM customers WHERE email != '' AND email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1) as t");
            $dupEmails = $stmtDupEmail->fetchColumn() ?: 0;
            $stmtDupTelp = $conn->query("SELECT SUM(c) FROM (SELECT COUNT(*) as c FROM customers WHERE telp != '' AND telp IS NOT NULL GROUP BY telp HAVING COUNT(*) > 1) as t");
            $dupTelps = $stmtDupTelp->fetchColumn() ?: 0;
            $totalDupContacts = $dupEmails + $dupTelps;

            // 2. Customers dengan 0 vehicles
            $stmtZeroVehicles = $conn->query("SELECT COUNT(c.id) FROM customers c LEFT JOIN vehicles v ON c.id = v.customer_id WHERE v.id IS NULL");
            $zeroVehiclesCust = $stmtZeroVehicles->fetchColumn() ?: 0;

            // 3. Duplicate rangka
            $stmtDupRangka = $conn->query("SELECT SUM(c) FROM (SELECT COUNT(*) as c FROM vehicles WHERE rangka != '' AND rangka IS NOT NULL GROUP BY rangka HAVING COUNT(*) > 1) as t");
            $dupRangka = $stmtDupRangka->fetchColumn() ?: 0;
            $totalDupVehicles = $dupRangka;

            // Data for duplicates contacts
            $stmtDupContactsData = $conn->query("
                SELECT id, nama, username, email, telp, company 
                FROM customers 
                WHERE email IN (SELECT email FROM customers WHERE email != '' AND email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1) 
                   OR telp IN (SELECT telp FROM customers WHERE telp != '' AND telp IS NOT NULL GROUP BY telp HAVING COUNT(*) > 1)
            ");
            $dupContactsData = $stmtDupContactsData->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // Data for 0 vehicles
            $stmtZeroVehiclesData = $conn->query("
                SELECT c.id, c.nama, c.username, c.company 
                FROM customers c 
                LEFT JOIN vehicles v ON c.id = v.customer_id 
                WHERE v.id IS NULL
            ");
            $zeroVehiclesData = $stmtZeroVehiclesData->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // Data for duplicate vehicles
            $stmtDupVehiclesData = $conn->query("
                SELECT v.id, v.nopol, v.rangka, c.nama as customer_name 
                FROM vehicles v 
                LEFT JOIN customers c ON v.customer_id = c.id
                WHERE v.rangka IN (SELECT rangka FROM vehicles WHERE rangka != '' AND rangka IS NOT NULL GROUP BY rangka HAVING COUNT(*) > 1)
            ");
            $dupVehiclesData = $stmtDupVehiclesData->fetchAll(PDO::FETCH_ASSOC) ?: [];

            echo json_encode([
                "customers" => (int)$totalCustomers,
                "customers_status" => $customersStatus,
                "vehicles" => (int)$totalVehicles,
                "vehicles_status" => $vehiclesStatus,
                "tickets" => (int)$totalTickets,
                "tickets_status" => $ticketsStatus,
                "dup_contacts" => (int)$totalDupContacts,
                "zero_vehicles_cust" => (int)$zeroVehiclesCust,
                "dup_vehicles" => (int)$totalDupVehicles,
                "dup_contacts_data" => $dupContactsData,
                "zero_vehicles_data" => $zeroVehiclesData,
                "dup_vehicles_data" => $dupVehiclesData
            ]);
            break;

        case 'customers':
            $whereClause = "";
            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $whereClause = "WHERE 1=1";
            $params = [];

            if ($search !== "") {
                $whereClause .= " AND (username LIKE ? OR email LIKE ? OR telp LIKE ? OR company LIKE ? OR nama LIKE ?)";
                $likeSearch = "%$search%";
                array_push($params, $likeSearch, $likeSearch, $likeSearch, $likeSearch, $likeSearch);
            }
            if ($status !== "") {
                $whereClause .= " AND status = ?";
                $params[] = $status;
            }

            // Hitung total data
            $stmtCount = $conn->prepare("SELECT COUNT(id) FROM customers $whereClause");
            $stmtCount->execute($params);
            $totalRows = $stmtCount->fetchColumn();

            // Ambil data dengan limit
            $sql = "SELECT id, username, email, telp, company, nama, status, created_at, (SELECT COUNT(id) FROM vehicles WHERE customer_id = customers.id) as unit_count FROM customers $whereClause ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
            $stmtData = $conn->prepare($sql);
            $stmtData->execute($params);
            $data = $stmtData->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "data" => $data,
                "pagination" => [
                    "page" => $page,
                    "limit" => $limit,
                    "total" => (int)$totalRows,
                    "totalPages" => ceil($totalRows / $limit)
                ]
            ]);
            break;

        case 'tickets':
            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $whereClause = "WHERE 1=1";
            $params = [];

            if ($search !== "") {
                $whereClause .= " AND (t.kode LIKE ? OR c.nama LIKE ? OR t.type LIKE ?)";
                $likeSearch = "%$search%";
                array_push($params, $likeSearch, $likeSearch, $likeSearch);
            }
            if ($status !== "") {
                $whereClause .= " AND t.status = ?";
                $params[] = $status;
            }

            $stmtCount = $conn->prepare("SELECT COUNT(t.id) FROM tickets t LEFT JOIN customers c ON t.customer_id = c.id $whereClause");
            $stmtCount->execute($params);
            $totalRows = $stmtCount->fetchColumn();

            $sql = "SELECT t.*, c.nama as customer_name, c.company as customer_company 
                    FROM tickets t 
                    LEFT JOIN customers c ON t.customer_id = c.id 
                    $whereClause 
                    ORDER BY t.created_at DESC 
                    LIMIT $limit OFFSET $offset";
            $stmtData = $conn->prepare($sql);
            $stmtData->execute($params);
            $data = $stmtData->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "data" => $data,
                "pagination" => [
                    "page" => $page,
                    "limit" => $limit,
                    "total" => (int)$totalRows,
                    "totalPages" => ceil($totalRows / $limit)
                ]
            ]);
            break;

        case 'vehicles':
            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $whereClause = "WHERE 1=1";
            $params = [];

            if ($search !== "") {
                $whereClause .= " AND (v.nopol LIKE ? OR v.rangka LIKE ? OR c.nama LIKE ?)";
                $likeSearch = "%$search%";
                array_push($params, $likeSearch, $likeSearch, $likeSearch);
            }
            if ($status !== "") {
                $whereClause .= " AND v.status = ?";
                $params[] = $status;
            }

            $stmtCount = $conn->prepare("SELECT COUNT(v.id) FROM vehicles v LEFT JOIN customers c ON v.customer_id = c.id $whereClause");
            $stmtCount->execute($params);
            $totalRows = $stmtCount->fetchColumn();

            $sql = "SELECT v.*, c.nama as customer_name 
                    FROM vehicles v 
                    LEFT JOIN customers c ON v.customer_id = c.id 
                    $whereClause 
                    ORDER BY v.created_at DESC 
                    LIMIT $limit OFFSET $offset";
            $stmtData = $conn->prepare($sql);
            $stmtData->execute($params);
            $data = $stmtData->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "data" => $data,
                "pagination" => [
                    "page" => $page,
                    "limit" => $limit,
                    "total" => (int)$totalRows,
                    "totalPages" => ceil($totalRows / $limit)
                ]
            ]);
            break;

        case 'customer_detail':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            
            // Get customer info
            $stmtCust = $conn->prepare("SELECT * FROM customers WHERE id = ?");
            $stmtCust->execute([$id]);
            $customer = $stmtCust->fetch(PDO::FETCH_ASSOC);

            if (!$customer) {
                http_response_code(404);
                echo json_encode(["message" => "Customer not found"]);
                exit();
            }

            // Get associated vehicles
            $stmtVehicles = $conn->prepare("SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC");
            $stmtVehicles->execute([$id]);
            $vehicles = $stmtVehicles->fetchAll(PDO::FETCH_ASSOC);

            // Get associated tickets
            $stmtTickets = $conn->prepare("SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC");
            $stmtTickets->execute([$id]);
            $tickets = $stmtTickets->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "customer" => $customer,
                "vehicles" => $vehicles,
                "tickets" => $tickets
            ]);
            break;

        case 'update_customer':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID"]); exit();
            }

            $stmtUpdate = $conn->prepare("UPDATE customers SET username = ?, email = ?, telp = ?, company = ?, sektor = ?, provinsi = ?, kabupaten = ?, kecamatan = ?, kelurahan = ?, alamat = ?, nama = ?, jabatan = ? WHERE id = ?");
            try {
                $stmtUpdate->execute([
                    $input['username'] ?? '',
                    $input['email'] ?? '',
                    $input['telp'] ?? '',
                    $input['company'] ?? '',
                    $input['sektor'] ?? '',
                    $input['provinsi'] ?? '',
                    $input['kabupaten'] ?? '',
                    $input['kecamatan'] ?? '',
                    $input['kelurahan'] ?? '',
                    $input['alamat'] ?? '',
                    $input['nama'] ?? '',
                    $input['jabatan'] ?? '',
                    $input['id']
                ]);
                echo json_encode(["status" => "success", "message" => "Customer updated successfully"]);
            } catch (Exception $e) {
                http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;

        case 'delete_customer':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID"]); exit();
            }

            try {
                $conn->beginTransaction();
                
                $id = $input['id'];
                // Delete related vehicles and tickets first (Cascading)
                $stmtDelVehicles = $conn->prepare("DELETE FROM vehicles WHERE customer_id = ?");
                $stmtDelVehicles->execute([$id]);
                
                $stmtDelTickets = $conn->prepare("DELETE FROM tickets WHERE customer_id = ?");
                $stmtDelTickets->execute([$id]);
                
                // Delete customer
                $stmtDelCust = $conn->prepare("DELETE FROM customers WHERE id = ?");
                $stmtDelCust->execute([$id]);
                
                $conn->commit();
                echo json_encode(["status" => "success", "message" => "Customer and related data deleted successfully"]);
            } catch (Exception $e) {
                $conn->rollBack();
                http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;

        case 'update_status':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id']) || !isset($input['status'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID or Status"]); exit();
            }

            try {
                $stmtUpdateStatus = $conn->prepare("UPDATE customers SET status = ? WHERE id = ?");
                $stmtUpdateStatus->execute([$input['status'], $input['id']]);
                echo json_encode(["status" => "success", "message" => "Customer status updated successfully"]);
            } catch (Exception $e) {
                http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;

        case 'update_vehicle':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID"]); exit();
            }

            $stmtUpdateVehicle = $conn->prepare("UPDATE vehicles SET nopol = ?, rangka = ?, odometer = ?, body_type = ?, payment = ? WHERE id = ?");
            try {
                $stmtUpdateVehicle->execute([
                    $input['nopol'] ?? '',
                    $input['rangka'] ?? '',
                    $input['odometer'] ?? '',
                    $input['body_type'] ?? '',
                    $input['payment'] ?? '',
                    $input['id']
                ]);
                echo json_encode(["status" => "success", "message" => "Vehicle updated successfully"]);
            } catch (Exception $e) {
                http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;

        case 'delete_vehicle':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID"]); exit();
            }

            try {
                $conn->beginTransaction();
                
                $id = $input['id'];
                
                // Get nopol of the vehicle to delete related tickets properly if tickets use nopol or vehicle_id
                // Since ticket schema typically uses nopol or customer_id, let's delete tickets matching nopol or vehicle_id
                // Assuming ticket schema has 'nopol' based on the usual pattern, or we can just assume tickets have vehicle_id
                $stmtGetNopol = $conn->prepare("SELECT nopol FROM vehicles WHERE id = ?");
                $stmtGetNopol->execute([$id]);
                $nopol = $stmtGetNopol->fetchColumn();

                if ($nopol) {
                    $stmtDelTickets = $conn->prepare("DELETE FROM tickets WHERE nopol = ?");
                    $stmtDelTickets->execute([$nopol]);
                }
                
                // Delete vehicle
                $stmtDelVehicle = $conn->prepare("DELETE FROM vehicles WHERE id = ?");
                $stmtDelVehicle->execute([$id]);
                
                $conn->commit();
                echo json_encode(["status" => "success", "message" => "Vehicle and related data deleted successfully"]);
            } catch (Exception $e) {
                $conn->rollBack();
                http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;

        case 'update_vehicle_status':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id']) || !isset($input['status'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID or Status"]); exit();
            }

            try {
                $stmtUpdateVehStatus = $conn->prepare("UPDATE vehicles SET status = ? WHERE id = ?");
                $stmtUpdateVehStatus->execute([$input['status'], $input['id']]);
                echo json_encode(["status" => "success", "message" => "Vehicle status updated successfully"]);
            } catch (Exception $e) {
                http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(["message" => "Invalid action"]);
            break;
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database Error", "error" => $e->getMessage()]);
}
?>
