#!/bin/bash
set -e

# Render injects $PORT dynamically — Apache must listen on it
PORT=${PORT:-80}

sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Debug: show driver env vars as read by PHP
php -r "echo '[ENV CHECK] CACHE_STORE=' . getenv('CACHE_STORE') . PHP_EOL;"
php -r "echo '[ENV CHECK] SESSION_DRIVER=' . getenv('SESSION_DRIVER') . PHP_EOL;"
php -r "echo '[ENV CHECK] QUEUE_CONNECTION=' . getenv('QUEUE_CONNECTION') . PHP_EOL;"
php -r "echo '[ENV CHECK] BROADCAST_CONNECTION=' . getenv('BROADCAST_CONNECTION') . PHP_EOL;"
php -r "echo '[ENV CHECK] APP_DEBUG=' . getenv('APP_DEBUG') . PHP_EOL;"
php -r "echo '[ENV CHECK] DB_CONNECTION=' . getenv('DB_CONNECTION') . PHP_EOL;"

# Clear any stale config cache from previous builds
php artisan config:clear

# Discover packages now that .env is available
php artisan package:discover --ansi

# Generate app key if not set (first deploy safety net)
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Run migrations automatically on every deploy
php artisan migrate --force

# Cache views for production performance
php artisan view:cache

# Create storage symlink for public file access
php artisan storage:link 2>/dev/null || true

# Start Apache in foreground (keeps container alive)
exec apache2-foreground
