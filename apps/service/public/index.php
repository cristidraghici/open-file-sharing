<?php

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;

require __DIR__ . '/../src/vendor/autoload.php';

// Create Container using PHP-DI
$containerBuilder = new ContainerBuilder();
$container = $containerBuilder->build();

// Create App
$app = AppFactory::createFromContainer($container);

// Add routing middleware
$app->addRoutingMiddleware();

// Add error handling middleware
$app->addErrorMiddleware(true, true, true);

// Define routes
$app->get('/hello/world', function ($request, $response) {
    $data = ['message' => 'Hello, World!'];
    $payload = json_encode($data);
    $response->getBody()->write($payload);
    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ->withStatus(200);
});

$app->run();
