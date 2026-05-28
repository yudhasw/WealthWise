<?php
// TEMPORARY DEBUG FILE - REMOVE AFTER DEBUGGING
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>PHP & Env Info</h2>";
echo "PHP Version: " . PHP_VERSION . "<br>";
echo "CACHE_STORE: " . getenv('CACHE_STORE') . "<br>";
echo "SESSION_DRIVER: " . getenv('SESSION_DRIVER') . "<br>";
echo "DB_CONNECTION: " . getenv('DB_CONNECTION') . "<br>";
echo "APP_ENV: " . getenv('APP_ENV') . "<br>";
echo "APP_DEBUG: " . getenv('APP_DEBUG') . "<br>";
echo "<hr>";

echo "<h2>Laravel Bootstrap Test</h2>";
try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require __DIR__ . '/../bootstrap/app.php';
    echo "App bootstrapped OK<br>";
    echo "Cache driver: " . $app->make('cache')->getDefaultDriver() . "<br>";
    echo "Session driver: " . $app->make('session')->getDefaultDriver() . "<br>";
} catch (\Throwable $e) {
    echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
