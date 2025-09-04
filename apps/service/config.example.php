<?php

declare(strict_types=1);

return [
    'displayErrorDetails' => true, // Set to false in production
    'logErrors' => true,
    'logErrorDetails' => true,
    'cors' => [
        'enabled' => true,
        'allow_origin' => ['*'], // Replace with specific origins in production, e.g., ['http://localhost:3000']
        'allow_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'allow_headers' => [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'X-Auth-Token',
            'X-CSRF-TOKEN',
            'Access-Control-Allow-Origin'
        ],
        'expose_headers' => [
            'Content-Length',
            'Content-Range',
            'X-Pagination-Total-Count',
            'X-Pagination-Page-Count',
            'X-Pagination-Current-Page',
            'X-Pagination-Per-Page'
        ],
        'max_age' => 86400, // 24 hours
        'allow_credentials' => true
    ],
    'app' => [
        'name' => 'Open File Sharing API',
        'version' => '1.0.0',
        'environment' => 'development', // 'production' or 'development'
    ],
];
