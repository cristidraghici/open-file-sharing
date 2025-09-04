<?php

declare(strict_types=1);

// Bootstrap the application
if (file_exists(__DIR__ . '/../../../app/src/bootstrap.php')) {
    $app = require __DIR__ . '/../../../app/src/bootstrap.php';
} else {
    $app = require __DIR__ . '/../src/bootstrap.php';
}

// Run the application
$app->run();
