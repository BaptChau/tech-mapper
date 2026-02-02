<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$dataPath = realpath(__DIR__ . '/../data/techs.json');
if ($dataPath === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to locate data file']);
    exit;
}

function readTechs(string $path): array {
    $raw = @file_get_contents($path);
    if ($raw === false) {
        throw new RuntimeException('Failed to read data');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid data');
    }
    return $data;
}

function writeTechs(string $path, array $list): void {
    $payload = json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($payload === false) {
        throw new RuntimeException('Failed to encode data');
    }
    $payload .= "\n";
    if (@file_put_contents($path, $payload, LOCK_EX) === false) {
        throw new RuntimeException('Failed to write data');
    }
}

function normalize(string $value): string {
    return strtolower(trim($value));
}

function unauthorized(): void {
    header('WWW-Authenticate: Basic realm="Tech Mapper"');
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $data = readTechs($dataPath);
        echo json_encode($data);
    } catch (Throwable $err) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to read data']);
    }
    exit;
}

if ($method === 'POST') {
    if ($techPassword === '') {
        unauthorized();
    }

    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($authHeader, 'Basic ')) {
        unauthorized();
    }
    $raw = base64_decode(substr($authHeader, 6), true);
    if ($raw === false || !str_contains($raw, ':')) {
        unauthorized();
    }
    [$user, $pass] = explode(':', $raw, 2);
    if ($user !== $techUser || $pass !== $techPassword) {
        unauthorized();
    }

    $body = file_get_contents('php://input');
    $payload = json_decode($body ?? '', true);
    $tech = is_array($payload) ? trim((string)($payload['tech'] ?? '')) : '';
    $language = is_array($payload) ? trim((string)($payload['language'] ?? '')) : '';

    if ($tech === '' || $language === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing tech or language']);
        exit;
    }

    try {
        $list = readTechs($dataPath);
        foreach ($list as $item) {
            if (!is_array($item)) {
                continue;
            }
            if (normalize((string)($item['tech'] ?? '')) === normalize($tech)) {
                http_response_code(409);
                echo json_encode(['error' => 'Tech already exists']);
                exit;
            }
        }
        $item = ['tech' => $tech, 'language' => $language];
        $list[] = $item;
        writeTechs($dataPath, $list);
        http_response_code(201);
        echo json_encode($item);
    } catch (Throwable $err) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write data']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
