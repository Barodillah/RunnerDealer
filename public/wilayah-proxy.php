<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=86400');

$type = isset($_GET['type']) ? $_GET['type'] : '';
$code = isset($_GET['code']) ? $_GET['code'] : '';

$allowed = ['provinces', 'regencies', 'districts', 'villages'];

if (!in_array($type, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid type']);
    exit;
}

if ($type === 'provinces') {
    $url = 'https://wilayah.id/api/provinces.json';
} else {
    if (empty($code)) {
        http_response_code(400);
        echo json_encode(['error' => 'Code required']);
        exit;
    }
    $url = "https://wilayah.id/api/{$type}/{$code}.json";
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => false,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || $response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch data']);
    exit;
}

echo $response;
