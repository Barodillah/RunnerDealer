<?php
require_once 'config.php';

// Cek koneksi DB
if (!$conn) {
    http_response_code(500);
    echo json_encode(["message" => "Database Connection Error", "error" => $dbError]);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

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
            $params = [];

            if ($search !== "") {
                $whereClause = "WHERE username LIKE ? OR email LIKE ? OR telp LIKE ? OR company LIKE ? OR nama LIKE ?";
                $likeSearch = "%$search%";
                $params = [$likeSearch, $likeSearch, $likeSearch, $likeSearch, $likeSearch];
            }

            // Hitung total data
            $stmtCount = $conn->prepare("SELECT COUNT(id) FROM customers $whereClause");
            $stmtCount->execute($params);
            $totalRows = $stmtCount->fetchColumn();

            // Ambil data dengan limit
            $sql = "SELECT id, username, email, telp, company, nama, status, created_at FROM customers $whereClause ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
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
            $whereClause = "";
            $params = [];

            if ($search !== "") {
                $whereClause = "WHERE t.kode LIKE ? OR c.nama LIKE ? OR t.type LIKE ?";
                $likeSearch = "%$search%";
                $params = [$likeSearch, $likeSearch, $likeSearch];
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
            $whereClause = "";
            $params = [];

            if ($search !== "") {
                $whereClause = "WHERE v.nopol LIKE ? OR v.rangka LIKE ? OR c.nama LIKE ?";
                $likeSearch = "%$search%";
                $params = [$likeSearch, $likeSearch, $likeSearch];
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
