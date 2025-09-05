<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\AuthService;
use App\Services\TokenService;
use OpenFileSharing\Dto\Model\LoginRequest;
use OpenFileSharing\Dto\Model\User as UserDto;
use OpenFileSharing\Dto\Model\AuthResponseData;
use OpenFileSharing\Dto\Model\AuthResponse;

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

    // Auth: Login
    $app->post('/auth/login', function (Request $request, Response $response) {
        $body = (array)($request->getParsedBody() ?? []);
        $username = (string)($body['username'] ?? '');
        $password = (string)($body['password'] ?? '');

        if ($username === '' || $password === '') {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Username and password are required',
                    'details' => ['fields' => ['username' => 'required', 'password' => 'required']]
                ]
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Build LoginRequest DTO
        $loginDto = (new LoginRequest())
            ->setUsername($username)
            ->setPassword($password);

        $auth = new AuthService();
        // Verify using raw values (service API unchanged), DTO constructed for type parity
        $user = $auth->verifyCredentials($loginDto->getUsername(), $loginDto->getPassword());
        if ($user === null) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'Invalid credentials',
                ]
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $tokenService = new TokenService();
        $token = $tokenService->createToken([
            'sub' => $user['id'],
            'username' => $user['username'],
            'roles' => $user['roles'],
        ]);

        // Build User DTO from service result
        $userDto = (new UserDto())
            ->setId((string)$user['id'])
            ->setUsername((string)$user['username'])
            ->setRoles((array)$user['roles']);

        // Build Auth DTOs
        $dataDto = (new AuthResponseData())
            ->setToken($token)
            ->setUser($userDto);
        $authResponseDto = (new AuthResponse())
            ->setData($dataDto);

        // Serialize manually to arrays via getters for JSON response
        $response->getBody()->write(json_encode([
            'data' => [
                'token' => $authResponseDto->getData()->getToken(),
                'user' => [
                    'id' => $authResponseDto->getData()->getUser()->getId(),
                    'username' => $authResponseDto->getData()->getUser()->getUsername(),
                    'roles' => $authResponseDto->getData()->getUser()->getRoles(),
                ],
            ]
        ]));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    });

    // Auth: Me
    $app->get('/auth/me', function (Request $request, Response $response) {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!preg_match('/^Bearer\s+(.*)$/i', $authHeader, $m)) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'Missing bearer token',
                ]
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        $token = $m[1];

        $tokenService = new TokenService();
        $payload = $tokenService->verifyToken($token);
        if ($payload === null) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'Invalid or expired token',
                ]
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $user = [
            'id' => $payload['sub'] ?? null,
            'username' => $payload['username'] ?? null,
            'roles' => $payload['roles'] ?? [],
        ];

        $response->getBody()->write(json_encode(['data' => $user]));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
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
