<?php

declare(strict_types=1);

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\AuthService;
use App\Services\TokenService;
use App\Services\MediaService;
use App\Middleware\AuthMiddleware;
use OpenFileSharing\Dto\Model\LoginRequest;
use OpenFileSharing\Dto\Model\User as UserDto;
use OpenFileSharing\Dto\Model\AuthResponseData;
use OpenFileSharing\Dto\Model\AuthResponse;
use App\Util\Serializer;
use OpenFileSharing\Dto\Model\FileMetadata as FileMetadataDto;
use OpenFileSharing\Dto\Model\MediaListGetResponse200;
use OpenFileSharing\Dto\Model\MediaIdGetResponse200;
use OpenFileSharing\Dto\Model\PaginationMeta;
use OpenFileSharing\Dto\Model\Links;
use Slim\Psr7\Stream;

return function (Slim\App $app) {
    // CORS Pre-Flight OPTIONS Request Handler
    $app->options('/{routes:.+}', function (Request $request, Response $response) {
        return $response;
    });


    // Media: Upload multiple (protected)
    $app->post('/api/media/uploads', function (Request $request, Response $response) {
        $uploadedFiles = $request->getUploadedFiles();
        $filesParam = $uploadedFiles['files'] ?? null;

        // Support fallback if client sent a single 'file'
        if ($filesParam === null && isset($uploadedFiles['file'])) {
            $filesParam = [$uploadedFiles['file']];
        }

        // Normalize to array of UploadedFileInterface
        $files = [];
        if (is_array($filesParam)) {
            foreach ($filesParam as $f) {
                if ($f !== null) {
                    $files[] = $f;
                }
            }
        } elseif ($filesParam !== null) {
            $files = [$filesParam];
        }

        if (count($files) === 0) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Missing files in form-data under key "files[]"',
                    'details' => ['fields' => ['files' => 'required']]
                ]
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Get current user from auth middleware
        $auth = $request->getAttribute('auth', []);
        $currentUsername = $auth['username'] ?? 'unknown';

        $media = new MediaService();
        $fileDTOs = [];

        foreach ($files as $file) {
            if ($file->getError() !== UPLOAD_ERR_OK) {
                continue; // skip errored files
            }

            $clientFilename = $file->getClientFilename() ?? 'upload.bin';

            // Get a temp path for MediaService; prefer stream URI when available
            $tmpPath = $file->getStream()->getMetadata('uri') ?? null;
            if (!is_string($tmpPath) || !is_file($tmpPath)) {
                // Fallback: write to a temp file first
                $tmpPath = tempnam(sys_get_temp_dir(), 'ofs_') ?: null;
                if ($tmpPath === null) {
                    continue; // skip when cannot create temp file
                }
                $stream = $file->getStream();
                $stream->rewind();
                file_put_contents($tmpPath, $stream->getContents());
            }

            try {
                $meta = $media->store($clientFilename, $tmpPath, $currentUsername);
            } catch (\Throwable $e) {
                continue; // skip failed store
            }

            $dto = (new FileMetadataDto())
                ->setId((string)$meta['id'])
                ->setFileName((string)$meta['filename'])
                ->setFileType(Serializer::inferFileTypeFromMime((string)$meta['mime']))
                ->setSize((int)$meta['size'])
                ->setUploadedBy($currentUsername)
                ->setUploadedAt(new \DateTime('now'));

            $fileDTOs[] = $dto;
        }

        // Serialize using shared serializer to avoid hard dependency on DTO availability at runtime
        $response->getBody()->write(json_encode([
            'data' => Serializer::fileMetadataListToArray($fileDTOs),
        ]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    })->add(new AuthMiddleware());

    // Media: Retrieve by id (metadata)
    $app->get('/api/media/{id}', function (Request $request, Response $response, array $args) {
        $id = (string)($args['id'] ?? '');
        if ($id === '') {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Missing media id',
                ]
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $media = new MediaService();
        $file = $media->findById($id);
        if ($file === null) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Media not found',
                ]
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Get metadata from the media service
        $all = $media->listAll();
        $fileMeta = null;
        foreach ($all as $m) {
            if ($m['id'] === $id) {
                $fileMeta = $m;
                break;
            }
        }

        if ($fileMeta === null) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Media metadata not found',
                ]
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Map to shared FileMetadata DTO
        $fileMetadataDto = (new FileMetadataDto())
            ->setId((string)$fileMeta['id'])
            ->setFileName((string)$fileMeta['filename'])
            ->setFileType(Serializer::inferFileTypeFromMime((string)($fileMeta['mime'] ?? 'application/octet-stream')))
            ->setSize((int)$fileMeta['size'])
            ->setUploadedBy($fileMeta['uploadedBy'] ?? 'unknown');
        if (!empty($fileMeta['uploadedAt'])) {
            try {
                $fileMetadataDto->setUploadedAt(new \DateTime((string)$fileMeta['uploadedAt']));
            } catch (\Throwable $e) {
            }
        }

        // Create the proper response structure
        $responseDto = (new MediaIdGetResponse200())
            ->setData($fileMetadataDto);

        $response->getBody()->write(json_encode(['data' => Serializer::fileMetadataToArray($responseDto->getData())]));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    });

    // Media: Serve file content by id
    $app->get('/api/media/{id}/content', function (Request $request, Response $response, array $args) {
        $id = (string)($args['id'] ?? '');
        if ($id === '') {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Missing media id',
                ]
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $media = new MediaService();
        $file = $media->findById($id);
        if ($file === null) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Media not found',
                ]
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $fh = fopen($file['path'], 'rb');
        if ($fh === false) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'SERVER_ERROR',
                    'message' => 'Could not open media',
                ]
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $stream = new Stream($fh);
        return $response
            ->withBody($stream)
            ->withHeader('Content-Type', $file['mime'])
            ->withHeader('Content-Disposition', 'inline');
    });

    // Media: List all (protected)
    $app->get('/api/media', function (Request $request, Response $response) {
        // Parse query parameters
        $queryParams = $request->getQueryParams();
        $page = max(1, (int)($queryParams['page'] ?? 1));
        $perPage = max(1, min(100, (int)($queryParams['per_page'] ?? 20))); // Limit to 100 items per page
        $type = $queryParams['type'] ?? null;

        // Validate type parameter
        if ($type !== null && !in_array($type, ['image', 'video', 'document', 'other'], true)) {
            $response->getBody()->write(json_encode([
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Invalid type parameter. Must be one of: image, video, document, other',
                ]
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $media = new MediaService();
        $result = $media->listPaginated($page, $perPage, $type);

        // Map array items to shared DTOs
        $items = [];
        foreach ($result['items'] as $m) {
            $dto = (new FileMetadataDto())
                ->setId((string)$m['id'])
                ->setFileName((string)$m['filename'])
                ->setFileType(Serializer::inferFileTypeFromMime((string)($m['mime'] ?? 'application/octet-stream')))
                ->setSize((int)$m['size'])
                ->setUploadedBy($m['uploadedBy'] ?? 'unknown');
            if (!empty($m['uploadedAt'])) {
                try {
                    $dto->setUploadedAt(new \DateTime((string)$m['uploadedAt']));
                } catch (\Throwable $e) {
                }
            }
            $items[] = $dto;
        }

        // Create pagination metadata
        $total = $result['total'];
        $totalPages = (int)ceil($total / $perPage);

        $paginationMeta = (new PaginationMeta())
            ->setPage($page)
            ->setPerPage($perPage)
            ->setTotal($total);

        // Create pagination links
        $baseUrl = '/api/media';
        $queryString = http_build_query(array_filter([
            'per_page' => $perPage !== 20 ? $perPage : null,
            'type' => $type,
        ]));
        $urlSuffix = $queryString ? '?' . $queryString : '';

        $links = (new Links())
            ->setFirst($baseUrl . ($queryString ? '?' . $queryString . '&page=1' : '?page=1'))
            ->setLast($baseUrl . ($queryString ? '?' . $queryString . '&page=' . $totalPages : '?page=' . $totalPages))
            ->setPrev($page > 1 ? $baseUrl . ($queryString ? '?' . $queryString . '&page=' . ($page - 1) : '?page=' . ($page - 1)) : null)
            ->setNext($page < $totalPages ? $baseUrl . ($queryString ? '?' . $queryString . '&page=' . ($page + 1) : '?page=' . ($page + 1)) : null);

        // Create the proper response structure
        $responseDto = (new MediaListGetResponse200())
            ->setData($items)
            ->setMeta($paginationMeta)
            ->setLinks($links);

        $response->getBody()->write(json_encode([
            'data' => Serializer::fileMetadataListToArray($responseDto->getData()),
            'meta' => [
                'page' => $responseDto->getMeta()->getPage(),
                'per_page' => $responseDto->getMeta()->getPerPage(),
                'total' => $responseDto->getMeta()->getTotal(),
            ],
            'links' => [
                'first' => $responseDto->getLinks()->getFirst(),
                'last' => $responseDto->getLinks()->getLast(),
                'prev' => $responseDto->getLinks()->getPrev(),
                'next' => $responseDto->getLinks()->getNext(),
            ]
        ]));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    })->add(new AuthMiddleware());

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
        $response->getBody()->write(json_encode([
            'data' => [
                'token' => $authResponseDto->getData()->getToken(),
                'user' => Serializer::userToArray($authResponseDto->getData()->getUser()),
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

        // Build User DTO from token payload and serialize
        $userDto = (new UserDto())
            ->setId((string)($payload['sub'] ?? ''))
            ->setUsername((string)($payload['username'] ?? ''))
            ->setRole((string)($payload['role'] ?? ''));

        $response->getBody()->write(json_encode(['data' => Serializer::userToArray($userDto)]));
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
