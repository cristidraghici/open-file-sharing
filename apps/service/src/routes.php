<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

return function (Slim\App $app) {
    // CORS Pre-Flight OPTIONS Request Handler
    $app->options('/{routes:.+}', function (Request $request, Response $response) {
        return $response;
    });

    // Main route
    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode(['data' => 'Welcome to Open File Sharing API']));

        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    });

    // Hello route
    $app->get('/hello/{name}', function (Request $request, Response $response) {
        $name = $request->getAttribute('name');

        $response->getBody()->write(json_encode(['data' => "Hello, $name!"]));

        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    });

    // Catch-all route for SPA (Single Page Application) - should be the last route
    $app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode([
            'error' => 'Not Found',
            'code' => 404
        ]));

        return $response
            ->withStatus(404)
            ->withHeader('Content-Type', 'application/json');
    });
};
