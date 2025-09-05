<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\TokenService;
use Psr\Http\Message\ResponseInterface as ResponseInterface;
use Psr\Http\Message\ServerRequestInterface as ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Factory\ResponseFactory;

class AuthMiddleware implements MiddlewareInterface
{
    private TokenService $tokenService;

    public function __construct(?TokenService $tokenService = null)
    {
        $this->tokenService = $tokenService ?? new TokenService();
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!preg_match('/^Bearer\s+(.*)$/i', $authHeader, $m)) {
            return $this->unauthorized('Missing bearer token');
        }

        $token = $m[1];
        $payload = $this->tokenService->verifyToken($token);
        if ($payload === null) {
            return $this->unauthorized('Invalid or expired token');
        }

        // Attach auth payload to the request for downstream handlers
        $request = $request->withAttribute('auth', $payload);

        return $handler->handle($request);
    }

    private function unauthorized(string $message): ResponseInterface
    {
        $factory = new ResponseFactory();
        $response = $factory->createResponse(401);
        $response->getBody()->write(json_encode([
            'error' => [
                'code' => 'UNAUTHORIZED',
                'message' => $message,
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
