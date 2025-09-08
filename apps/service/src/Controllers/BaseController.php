<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;

abstract class BaseController
{
    /**
     * Create a JSON response with data
     */
    protected function jsonResponse(Response $response, array $data, int $statusCode = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withStatus($statusCode)
            ->withHeader('Content-Type', 'application/json');
    }

    /**
     * Create a success JSON response with data
     */
    protected function successResponse(Response $response, $data, int $statusCode = 200): Response
    {
        return $this->jsonResponse($response, ['data' => $data], $statusCode);
    }

    /**
     * Create an error JSON response
     */
    protected function errorResponse(Response $response, string $code, string $message, array $details = null, int $statusCode = 400): Response
    {
        $error = [
            'code' => $code,
            'message' => $message,
        ];

        if ($details !== null) {
            $error['details'] = $details;
        }

        return $this->jsonResponse($response, ['error' => $error], $statusCode);
    }

    /**
     * Create a validation error response
     */
    protected function validationErrorResponse(Response $response, string $message, array $fields = []): Response
    {
        $details = empty($fields) ? null : ['fields' => $fields];
        return $this->errorResponse($response, 'VALIDATION_ERROR', $message, $details, 400);
    }

    /**
     * Create a not found error response
     */
    protected function notFoundResponse(Response $response, string $message = 'Resource not found'): Response
    {
        return $this->errorResponse($response, 'NOT_FOUND', $message, null, 404);
    }

    /**
     * Create an unauthorized error response
     */
    protected function unauthorizedResponse(Response $response, string $message = 'Unauthorized'): Response
    {
        return $this->errorResponse($response, 'UNAUTHORIZED', $message, null, 401);
    }

    /**
     * Create a server error response
     */
    protected function serverErrorResponse(Response $response, string $message = 'Internal server error'): Response
    {
        return $this->errorResponse($response, 'SERVER_ERROR', $message, null, 500);
    }

    /**
     * Create a no content response
     */
    protected function noContentResponse(Response $response): Response
    {
        return $response->withStatus(204);
    }
}
