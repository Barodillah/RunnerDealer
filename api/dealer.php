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
        case 'sektor_stats':
            $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
            $where = "WHERE sektor IS NOT NULL AND sektor != ''";
            
            if ($filter === '1y') {
                $where .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            } elseif ($filter === '6m') {
                $where .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)";
            } elseif ($filter === '3m') {
                $where .= " AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
            }

            $stmt = $conn->query("SELECT sektor, COUNT(id) as count FROM customers $where GROUP BY sektor ORDER BY count DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["status" => "success", "data" => $data]);
            break;

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

            // Get engagements
            $stmtEngage = $conn->prepare("SELECT * FROM engagements WHERE customer_id = ? ORDER BY upload_month DESC, created_at DESC");
            $stmtEngage->execute([$id]);
            $engagements = $stmtEngage->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "customer" => $customer,
                "vehicles" => $vehicles,
                "tickets" => $tickets,
                "engagements" => $engagements
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

        case 'get_all_usernames':
            $stmt = $conn->query("SELECT username FROM customers WHERE username IS NOT NULL AND username != ''");
            $usernames = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $usernames]);
            break;

        case 'upload_engagements':
            $req = json_decode(file_get_contents("php://input"), true);
            $data = (is_array($req) && isset($req['data'])) ? $req['data'] : $req;
            if (!is_array($data)) {
                echo json_encode(["status" => "error", "message" => "Invalid data"]);
                break;
            }

            $uploadDate = (is_array($req) && isset($req['date']) && !empty($req['date'])) ? $req['date'] : date('Y-m-d');
            $currentMonth = date('Y-m-01', strtotime($uploadDate));
            $successCount = 0;
            $notFoundUsernames = [];

            foreach ($data as $row) {
                $username = isset($row['username']) ? trim($row['username']) : '';
                $status = isset($row['status']) ? trim($row['status']) : '';

                if (empty($username)) continue;

                // Find customer_id case-insensitively
                $stmt = $conn->prepare("SELECT id, username FROM customers WHERE LOWER(username) = LOWER(?) LIMIT 1");
                $stmt->execute([$username]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($customer) {
                    $customerId = $customer['id'];
                    $dbUsername = $customer['username'];

                    // Update username if case differs
                    if ($dbUsername !== $username) {
                        $updateStmt = $conn->prepare("UPDATE customers SET username = ? WHERE id = ?");
                        $updateStmt->execute([$username, $customerId]);
                    }

                    $insertStmt = $conn->prepare("INSERT INTO engagements (customer_id, username, status, upload_month) VALUES (?, ?, ?, ?)");
                    $insertStmt->execute([$customerId, $username, $status, $currentMonth]);
                    $successCount++;
                } else {
                    $notFoundUsernames[] = $username;
                }
            }

            echo json_encode([
                "status" => "success", 
                "success_count" => $successCount,
                "not_found_count" => count($notFoundUsernames),
                "not_found_usernames" => $notFoundUsernames
            ]);
            break;

        case 'get_engagements_summary':
            $stmt = $conn->query("
                SELECT c.id, c.username, c.nama, c.telp, c.company, c.status,
                  (SELECT status FROM engagements WHERE customer_id = c.id ORDER BY upload_month DESC, created_at DESC LIMIT 1) as latest_status,
                  (SELECT COUNT(*) FROM vehicles WHERE customer_id = c.id) as vehicle_count
                FROM customers c
                ORDER BY c.nama ASC
            ");
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $customers]);
            break;

        case 'need_attention_customers':
            $stmt = $conn->query("
                SELECT c.id, c.username, c.email, c.telp, c.company, c.nama, c.status, c.created_at,
                  (SELECT COUNT(id) FROM vehicles WHERE customer_id = c.id) as unit_count,
                  (SELECT status FROM engagements WHERE customer_id = c.id ORDER BY upload_month DESC, created_at DESC LIMIT 1) as latest_status
                FROM customers c
                HAVING (
                  SELECT COUNT(id) FROM engagements WHERE customer_id = c.id AND LOWER(status) = 'engage'
                ) = 0
                ORDER BY c.created_at DESC
            ");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $data]);
            break;

        case 'get_customer_password':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            $stmt = $conn->prepare("SELECT password FROM customer_passwords WHERE customer_id = ?");
            $stmt->execute([$id]);
            $password = $stmt->fetchColumn();
            echo json_encode(["status" => "success", "password" => $password ?: null]);
            break;

        case 'save_customer_password':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id']) || !isset($input['password'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing data"]); exit();
            }
            $customerId = $input['id'];
            $username = $input['username'] ?? '';
            $password = $input['password'];
            
            // Cek apakah sudah ada
            $stmtCheck = $conn->prepare("SELECT id FROM customer_passwords WHERE customer_id = ?");
            $stmtCheck->execute([$customerId]);
            if ($stmtCheck->fetch()) {
                $stmtUpdate = $conn->prepare("UPDATE customer_passwords SET password = ?, username = ? WHERE customer_id = ?");
                $stmtUpdate->execute([$password, $username, $customerId]);
            } else {
                $stmtInsert = $conn->prepare("INSERT INTO customer_passwords (customer_id, username, password) VALUES (?, ?, ?)");
                $stmtInsert->execute([$customerId, $username, $password]);
            }
            echo json_encode(["status" => "success", "message" => "Password saved"]);
            break;

        case 'get_backup_passwords':
            $stmt = $conn->query("
                SELECT cp.*, c.nama as customer_name, c.company 
                FROM customer_passwords cp 
                JOIN customers c ON cp.customer_id = c.id
                ORDER BY c.nama ASC
            ");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $data]);
            break;

        case 'update_backup_login':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID"]); exit();
            }
            $stmt = $conn->prepare("UPDATE customer_passwords SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$input['id']]);
            echo json_encode(["status" => "success", "message" => "Login updated"]);
            break;

        case 'update_ticket_status':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405); echo json_encode(["message" => "Method not allowed"]); exit();
            }
            if (!$input || !isset($input['id']) || !isset($input['status'])) {
                http_response_code(400); echo json_encode(["message" => "Bad Request: Missing ID or Status"]); exit();
            }

            try {
                $stmtUpdateStatus = $conn->prepare("UPDATE tickets SET status = ? WHERE id = ?");
                $stmtUpdateStatus->execute([$input['status'], $input['id']]);
                echo json_encode(["status" => "success", "message" => "Ticket status updated successfully"]);
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
