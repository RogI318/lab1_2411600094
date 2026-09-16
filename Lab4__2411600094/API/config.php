<?php
/**
 * API Configuration
 * Laboratory Exercise 4
 */

// API Settings
define('API_VERSION', '1.0.0');
define('API_NAME', 'Student Portal API');

// Data file path
define('DATA_FILE_PATH', __DIR__ . '/data.json');

// CORS settings
define('ALLOWED_ORIGINS', ['http://localhost', 'http://127.0.0.1']);

// Enable error reporting for development
if ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set default timezone
date_default_timezone_set('Asia/Manila');

// Helper function for logging
function logApiRequest($message) {
    $logFile = __DIR__ . '/api.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}
?>