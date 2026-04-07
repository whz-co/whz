<?php
// save-data.php - For server-side saving
header('Content-Type: application/json');

$data = file_get_contents('php://input');
$json = json_decode($data, true);

if ($json) {
    file_put_contents('data.json', json_encode($json, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
}
?>
