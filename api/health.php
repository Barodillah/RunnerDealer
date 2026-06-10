<?php
require_once 'config.php';

$overallStatus = ($dbStatus === "ok") ? "ok" : "error";

if ($overallStatus === "error") {
    http_response_code(503); // Service Unavailable
} else {
    http_response_code(200);
}

echo json_encode([
    "status" => $overallStatus,
    "database" => $dbStatus,
    "timestamp" => date("Y-m-d H:i:s")
]);
?>
