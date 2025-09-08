<?php

declare(strict_types=1);

use App\Controllers\MediaController;
use App\Controllers\AuthController;
use App\Controllers\HomeController;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

return function (Slim\App $app) {
    // Initialize controllers
    $mediaController = new MediaController();
    $authController = new AuthController();
    $homeController = new HomeController();

    // CORS Pre-Flight OPTIONS Request Handler
    $app->options('/{routes:.+}', [$homeController, 'optionsHandler']);

    // Media Routes
    $app->post('/api/media/uploads', [$mediaController, 'upload'])->add(new AuthMiddleware());
    $app->get('/api/media/{id}', [$mediaController, 'getById']);
    $app->get('/api/media/{id}/content', [$mediaController, 'content']);
    $app->get('/api/media', [$mediaController, 'list'])->add(new AuthMiddleware());
    $app->delete('/api/media/{id}', [$mediaController, 'delete'])->add(new AdminMiddleware())->add(new AuthMiddleware());

    // Auth Routes
    $app->post('/auth/login', [$authController, 'login']);
    $app->get('/auth/me', [$authController, 'me']);

    // General Routes
    $app->get('/', [$homeController, 'index']);
    $app->get('/hello/{name}', [$homeController, 'hello']);

    // Catch-all route for SPA (Single Page Application) - should be the last route
    $app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', [$homeController, 'notFound']);
};
