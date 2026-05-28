<?php
// TEMPORARY DEBUG FILE - REMOVE AFTER DEBUGGING
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>PHP & Env Info</h2>";
echo "PHP: " . PHP_VERSION . "<br>";
echo "CACHE_STORE: " . getenv('CACHE_STORE') . "<br>";
echo "SESSION_DRIVER: " . getenv('SESSION_DRIVER') . "<br>";
echo "DB_CONNECTION: " . getenv('DB_CONNECTION') . "<br>";
echo "APP_ENV: " . getenv('APP_ENV') . "<br>";
echo "DATABASE_URL set: " . (getenv('DATABASE_URL') ? 'yes' : 'no') . "<br>";
echo "<hr>";

echo "<h2>Simulate GET /api/test</h2>";
try {
    require __DIR__ . '/../vendor/autoload.php';

    $app = require __DIR__ . '/../bootstrap/app.php';

    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

    $request = Illuminate\Http\Request::create('/api/test', 'GET');

    $response = $kernel->handle($request);

    echo "HTTP Status: " . $response->getStatusCode() . "<br>";
    echo "Response: <pre>" . htmlspecialchars(substr($response->getContent(), 0, 3000)) . "</pre>";

    $kernel->terminate($request, $response);
} catch (\Throwable $e) {
    echo "<strong>Exception:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<strong>Class:</strong> " . get_class($e) . "<br>";
    echo "<strong>File:</strong> " . $e->getFile() . ":" . $e->getLine() . "<br>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "<hr><h2>Laravel Log (last 50 lines)</h2><pre>";
$logPath = __DIR__ . '/../storage/logs/laravel.log';
if (file_exists($logPath)) {
    $lines = file($logPath);
    $last = array_slice($lines, -50);
    echo htmlspecialchars(implode('', $last));
} else {
    echo "No log file found";
}
echo "</pre>";
