<?php
require_once 'config.php';

// Cek apakah koneksi database berhasil (diset di config.php)
if (!$conn) {
    http_response_code(500);
    echo json_encode(["message" => "Database Connection Error: " . $dbError]);
    exit();
}

// Ambil input JSON
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid JSON Input"]);
    exit();
}

$isExisting = isset($data->isExisting) ? $data->isExisting : false;
$formData = isset($data->formData) ? $data->formData : null;
$vehicles = isset($data->vehicles) ? $data->vehicles : [];

if (!$formData) {
    http_response_code(400);
    echo json_encode(["message" => "Form data is required"]);
    exit();
}

try {
    $conn->beginTransaction();

    $customerId = null;
    $refType = "";
    
    // Fungsi untuk generate random string 4 digit
    $randNum = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    $year = date('Y');

    if ($isExisting === false) {
        // --- 1. KONSUMEN BARU (New) ---
        // Cek email atau telp
        $stmtCheck = $conn->prepare("SELECT id FROM customers WHERE email = ? OR telp = ? LIMIT 1");
        $stmtCheck->execute([$formData->email, $formData->telp]);
        
        if ($stmtCheck->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Email atau Nomor Telepon sudah terdaftar. Silakan pilih 'Sudah Pernah Aktivasi' atau gunakan data lain."]);
            $conn->rollBack();
            exit();
        }

        // Insert ke customers
        $stmtInsertCust = $conn->prepare("INSERT INTO customers (username, email, telp, company, sektor, provinsi, kabupaten, kecamatan, kelurahan, alamat, nama, jabatan, jumlah, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', NOW())");
        $stmtInsertCust->execute([
            $formData->username ?? '',
            $formData->email ?? '',
            $formData->telp ?? '',
            $formData->company ?? '',
            $formData->sektor ?? '',
            $formData->provinsi ?? '',
            $formData->kabupaten ?? '',
            $formData->kecamatan ?? '',
            $formData->kelurahan ?? '',
            $formData->alamat ?? '',
            $formData->nama ?? '',
            $formData->jabatan ?? '',
            $formData->jumlah ?? 0
        ]);
        
        $customerId = $conn->lastInsertId();
        $refType = "NEW";

    } else {
        // --- 2. SUDAH PERNAH AKTIVASI (Existing) ---
        // Cek username, email, telp secara berurutan
        $foundCustomer = false;
        
        $queries = [
            "SELECT id FROM customers WHERE username = ? LIMIT 1" => $formData->username ?? null,
            "SELECT id FROM customers WHERE email = ? LIMIT 1" => $formData->email ?? null,
            "SELECT id FROM customers WHERE telp = ? LIMIT 1" => $formData->telp ?? null,
        ];
        
        foreach ($queries as $sql => $val) {
            if (!empty($val)) {
                $stmtCheck = $conn->prepare($sql);
                $stmtCheck->execute([$val]);
                if ($stmtCheck->rowCount() > 0) {
                    $row = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                    $customerId = $row['id'];
                    $foundCustomer = true;
                    break; // Keluar dari loop jika sudah ketemu
                }
            }
        }
        
        if ($foundCustomer) {
            // Jika ketemu, tidak perlu insert customer, cukup lanjutkan dengan customerId tersebut
            $refType = "EXT";
        } else {
            // Jika TIDAK ketemu, simpan/tambah customer baru dengan status 'Other'
            $stmtInsertCust = $conn->prepare("INSERT INTO customers (username, email, telp, company, sektor, provinsi, kabupaten, kecamatan, kelurahan, alamat, nama, jabatan, jumlah, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Other', NOW())");
            $stmtInsertCust->execute([
                $formData->username ?? '',
                $formData->email ?? '',
                $formData->telp ?? '',
                $formData->company ?? '',
                $formData->sektor ?? '',
                $formData->provinsi ?? '',
                $formData->kabupaten ?? '',
                $formData->kecamatan ?? '',
                $formData->kelurahan ?? '',
                $formData->alamat ?? '',
                $formData->nama ?? '',
                $formData->jabatan ?? '',
                $formData->jumlah ?? 0
            ]);
            
            $customerId = $conn->lastInsertId();
            $refType = "OTH";
        }
    }

    // --- 3. INSERT VEHICLES ---
    if (!empty($vehicles) && $customerId) {
        $stmtInsertVeh = $conn->prepare("INSERT INTO vehicles (customer_id, rangka, nopol, odometer, payment, body_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'New', NOW())");
        
        foreach ($vehicles as $v) {
            // Menggabungkan nilai jika payment="6" (Lainnya) atau bodyType="8" (Lainnya)
            $paymentVal = $v->payment;
            if ($paymentVal === "6" && !empty($v->customPayment)) {
                $paymentVal = "Lainnya: " . $v->customPayment;
            }
            
            $bodyTypeVal = isset($v->bodyType) ? $v->bodyType : null;
            if ($bodyTypeVal === "8" && !empty($v->customBodyType)) {
                $bodyTypeVal = "Lainnya: " . $v->customBodyType;
            }
            
            $stmtInsertVeh->execute([
                $customerId,
                $v->rangka ?? '',
                $v->nopol ?? '',
                $v->odometer ?? 0,
                $paymentVal,
                $bodyTypeVal
            ]);
        }
    }

    // --- 4. INSERT TICKETS ---
    $refId = "REG-" . $refType . "-" . $year . "-" . $randNum;
    $ticketType = ($refType === "NEW") ? "Pendaftaran Baru" : "Penambahan Unit";
    
    $stmtInsertTicket = $conn->prepare("INSERT INTO tickets (kode, customer_id, type, status, created_at) VALUES (?, ?, ?, 'New', NOW())");
    $stmtInsertTicket->execute([
        $refId,
        $customerId,
        $ticketType
    ]);

    // Commit transaksi
    $conn->commit();

    // Kirim response sukses
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Data berhasil disimpan.",
        "refId" => $refId,
        "customerId" => $customerId
    ]);

} catch (Exception $e) {
    // Rollback transaksi jika terjadi kesalahan
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Gagal menyimpan data: " . $e->getMessage()]);
}
?>
