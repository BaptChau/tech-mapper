<?php
declare(strict_types=1);

function loadDotenv(string $path): array {
    if (!is_file($path)) {
        return [];
    }

    $vars = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }
        $key = trim($parts[0]);
        $value = trim($parts[1]);
        if ($value !== '' && (($value[0] === '"' && $value[-1] === '"') || ($value[0] === "'" && $value[-1] === "'"))) {
            $value = substr($value, 1, -1);
        }
        if ($key !== '' && !array_key_exists($key, $vars)) {
            $vars[$key] = $value;
        }
    }

    return $vars;
}

$dotenv = loadDotenv(__DIR__ . '/../.env');

$techUser = getenv('TECH_USER');
if ($techUser === false || $techUser === '') {
    $techUser = $dotenv['TECH_USER'] ?? 'tech';
}

$techPassword = getenv('TECH_PASSWORD');
if ($techPassword === false || $techPassword === '') {
    $techPassword = $dotenv['TECH_PASSWORD'] ?? '';
}
