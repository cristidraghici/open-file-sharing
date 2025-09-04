<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class CorsMiddleware implements MiddlewareInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            return $this->handlePreflight($request);
        }

        // Process the request and get the response
        $response = $handler->handle($request);

        // Add CORS headers to the response
        return $this->addCorsHeaders($request, $response);
    }

    private function handlePreflight(ServerRequestInterface $request): ResponseInterface
    {
        $responseFactory = new \Slim\Psr7\Factory\ResponseFactory();
        $response = $responseFactory->createResponse(204);
        
        if (!$this->isOriginAllowed($request)) {
            return $response->withStatus(403);
        }

        return $this->addCorsHeaders($request, $response);
    }

    private function addCorsHeaders(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $origin = $request->getHeaderLine('Origin');
        
        // If no origin is set or origin is not allowed, return the response as is
        if (empty($origin) || !$this->isOriginAllowed($request)) {
            return $response;
        }

        $headers = [
            'Access-Control-Allow-Origin' => $this->getAllowedOrigin($origin),
            'Access-Control-Allow-Methods' => implode(', ', $this->config['allow_methods']),
            'Access-Control-Allow-Headers' => implode(', ', $this->config['allow_headers']),
            'Access-Control-Expose-Headers' => implode(', ', $this->config['expose_headers']),
            'Access-Control-Max-Age' => (string) $this->config['max_age'],
        ];

        if ($this->config['allow_credentials']) {
            $headers['Access-Control-Allow-Credentials'] = 'true';
        }

        // Add CORS headers to the response
        foreach ($headers as $name => $value) {
            if (!$response->hasHeader($name)) {
                $response = $response->withHeader($name, $value);
            }
        }

        return $response;
    }

    private function isOriginAllowed(ServerRequestInterface $request): bool
    {
        $origin = $request->getHeaderLine('Origin');
        
        if (empty($origin)) {
            return false;
        }

        // Allow all origins
        if (in_array('*', $this->config['allow_origin'], true)) {
            return true;
        }

        return in_array($origin, $this->config['allow_origin'], true);
    }

    private function getAllowedOrigin(string $origin): string
    {
        return in_array('*', $this->config['allow_origin'], true) 
            ? '*' 
            : $origin;
    }
}
