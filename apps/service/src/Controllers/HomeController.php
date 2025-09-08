<?php

declare(strict_types=1);

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class HomeController extends BaseController
{
    public function index(Request $request, Response $response): Response
    {
        return $this->successResponse($response, 'Welcome to Open File Sharing API');
    }

    public function hello(Request $request, Response $response): Response
    {
        $name = $request->getAttribute('name');
        return $this->successResponse($response, "Hello, $name!");
    }

    public function optionsHandler(Request $request, Response $response): Response
    {
        return $response;
    }

    public function notFound(Request $request, Response $response): Response
    {
        return $this->jsonResponse($response, [
            'error' => 'Not Found',
            'code' => 404
        ], 404);
    }
}
