<?php

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

// Create Container
$containerBuilder = new ContainerBuilder();
$container = $containerBuilder->build();

// Create App
$app = AppFactory::createFromContainer($container);

// Add routing middleware
$app->addRoutingMiddleware();

// Add error handling middleware
$app->addErrorMiddleware(true, true, true);

// Routes
$app->get('/hello/world', function ($request, $response) {
    $data = ['message' => 'Hello, World!'];
    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

return $app;
