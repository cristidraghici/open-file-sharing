<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\AuthService;
use App\Services\TokenService;
use App\Util\Serializer;
use OpenFileSharing\Dto\Model\LoginRequest;
use OpenFileSharing\Dto\Model\User as UserDto;
use OpenFileSharing\Dto\Model\AuthResponseData;
use OpenFileSharing\Dto\Model\AuthResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController extends BaseController
{
    public function login(Request $request, Response $response): Response
    {
        $body = (array)($request->getParsedBody() ?? []);
        $username = (string)($body['username'] ?? '');
        $password = (string)($body['password'] ?? '');

        if ($username === '' || $password === '') {
            return $this->validationErrorResponse(
                $response,
                'Username and password are required',
                ['username' => 'required', 'password' => 'required']
            );
        }

        // Build LoginRequest DTO
        $loginDto = (new LoginRequest())
            ->setUsername($username)
            ->setPassword($password);

        $auth = new AuthService();
        // Verify using raw values (service API unchanged), DTO constructed for type parity
        $user = $auth->verifyCredentials($loginDto->getUsername(), $loginDto->getPassword());
        if ($user === null) {
            return $this->unauthorizedResponse($response, 'Invalid credentials');
        }

        $tokenService = new TokenService();
        $token = $tokenService->createToken([
            'sub' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
        ]);

        // Build User DTO from service result
        $userDto = (new UserDto())
            ->setId((string)$user['id'])
            ->setUsername((string)$user['username'])
            ->setRole((string)$user['role']);

        // Build Auth DTOs
        $dataDto = (new AuthResponseData())
            ->setToken($token)
            ->setUser($userDto);
        $authResponseDto = (new AuthResponse())
            ->setData($dataDto);

        // Serialize DTOs for JSON response
        return $this->successResponse($response, [
            'token' => $authResponseDto->getData()->getToken(),
            'user' => Serializer::userToArray($authResponseDto->getData()->getUser()),
        ]);
    }

    public function me(Request $request, Response $response): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (!preg_match('/^Bearer\s+(.*)$/i', $authHeader, $m)) {
            return $this->unauthorizedResponse($response, 'Missing bearer token');
        }
        $token = $m[1];

        $tokenService = new TokenService();
        $payload = $tokenService->verifyToken($token);
        if ($payload === null) {
            return $this->unauthorizedResponse($response, 'Invalid or expired token');
        }

        // Build User DTO from token payload and serialize
        $userDto = (new UserDto())
            ->setId((string)($payload['sub'] ?? ''))
            ->setUsername((string)($payload['username'] ?? ''))
            ->setRole((string)($payload['role'] ?? ''));

        return $this->successResponse($response, Serializer::userToArray($userDto));
    }
}
