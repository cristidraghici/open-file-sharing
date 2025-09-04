<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;

$config = require __DIR__ . '/../config.php';

// Create Container
$containerBuilder = new ContainerBuilder();
$containerBuilder->addDefinitions([
    'config' => $config,
]);
$container = $containerBuilder->build();

// Create App
$app = AppFactory::createFromContainer($container);

// Parse JSON, form data and XML
$app->addBodyParsingMiddleware();

// Add routing middleware
$app->addRoutingMiddleware();

// Add CORS middleware
$app->add(new App\Middleware\CorsMiddleware($config['cors']));

// Add error handling middleware
$errorMiddleware = $app->addErrorMiddleware(
    $config['displayErrorDetails'] ?? false,
    $config['logErrors'] ?? true,
    $config['logErrorDetails'] ?? true
);
$errorHandler = $errorMiddleware->getDefaultErrorHandler();
$errorHandler->forceContentType('application/json');

// Register routes
(require __DIR__ . '/routes.php')($app);

return $app;
