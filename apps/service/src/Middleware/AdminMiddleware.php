<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as ResponseInterface;
use Psr\Http\Message\ServerRequestInterface as ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Factory\ResponseFactory;

class AdminMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Get the auth payload from the request (set by AuthMiddleware)
        $auth = $request->getAttribute('auth');
        
        if ($auth === null) {
            return $this->forbidden('Authentication required');
        }
        
        $userRole = $auth['role'] ?? null;
        
        if ($userRole !== 'admin') {
            return $this->forbidden('Admin access required');
        }

        return $handler->handle($request);
    }

    private function forbidden(string $message): ResponseInterface
    {
        $factory = new ResponseFactory();
        $response = $factory->createResponse(403);
        $response->getBody()->write(json_encode([
            'error' => [
                'code' => 'FORBIDDEN',
                'message' => $message,
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
