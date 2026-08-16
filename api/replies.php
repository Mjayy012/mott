<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const REPLY_MAX_LENGTH = 5000;

$dataDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
$dataFile = $dataDir . DIRECTORY_SEPARATOR . 'reply.json';

function reply_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true) && !is_dir($dataDir)) {
    reply_json(500, ['ok' => false, 'error' => 'Could not create data directory.']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($dataFile)) {
        reply_json(200, ['ok' => true, 'reply' => null]);
    }

    $raw = file_get_contents($dataFile);
    $reply = json_decode($raw ?: '{}', true);
    reply_json(200, ['ok' => true, 'reply' => is_array($reply) && !empty($reply) ? $reply : null]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply_json(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$rawBody = file_get_contents('php://input') ?: '';
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    $payload = $_POST;
}

$message = trim((string) ($payload['message'] ?? ''));
$page = substr(trim((string) ($payload['page'] ?? 'story.html')), 0, 200);

if ($message === '') {
    reply_json(422, ['ok' => false, 'error' => 'Message is required.']);
}

if (strlen($message) > REPLY_MAX_LENGTH) {
    reply_json(422, ['ok' => false, 'error' => 'Message is too long.']);
}

$reply = [
    'message' => $message,
    'page' => $page,
    'updated_at' => gmdate('c'),
];

$handle = fopen($dataFile, 'c+');
if (!$handle) {
    reply_json(500, ['ok' => false, 'error' => 'Could not open reply file.']);
}

flock($handle, LOCK_EX);
rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode($reply, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

reply_json(200, ['ok' => true, 'reply' => $reply]);
