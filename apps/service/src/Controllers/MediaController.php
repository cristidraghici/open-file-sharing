<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Services\MediaService;
use App\Util\Serializer;
use OpenFileSharing\Dto\Model\FileMetadata as FileMetadataDto;
use OpenFileSharing\Dto\Model\MediaListGetResponse200;
use OpenFileSharing\Dto\Model\MediaIdGetResponse200;
use OpenFileSharing\Dto\Model\PaginationMeta;
use OpenFileSharing\Dto\Model\Links;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Stream;

class MediaController extends BaseController
{
    public function upload(Request $request, Response $response): Response
    {
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
            return $this->validationErrorResponse(
                $response,
                'Missing files in form-data under key "files[]"',
                ['files' => 'required']
            );
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

        return $this->successResponse($response, Serializer::fileMetadataListToArray($fileDTOs), 201);
    }

    public function getById(Request $request, Response $response, array $args): Response
    {
        $id = (string)($args['id'] ?? '');
        if ($id === '') {
            return $this->validationErrorResponse($response, 'Missing media id');
        }

        $media = new MediaService();
        $file = $media->findById($id);
        if ($file === null) {
            return $this->notFoundResponse($response, 'Media not found');
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
            return $this->notFoundResponse($response, 'Media metadata not found');
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

        $responseDto = (new MediaIdGetResponse200())
            ->setData($fileMetadataDto);

        return $this->successResponse($response, Serializer::fileMetadataToArray($responseDto->getData()));
    }

    public function content(Request $request, Response $response, array $args): Response
    {
        $id = (string)($args['id'] ?? '');
        if ($id === '') {
            return $this->validationErrorResponse($response, 'Missing media id');
        }

        $media = new MediaService();
        $file = $media->findById($id);
        if ($file === null) {
            return $this->notFoundResponse($response, 'Media not found');
        }

        $fh = fopen($file['path'], 'rb');
        if ($fh === false) {
            return $this->serverErrorResponse($response, 'Could not open media');
        }

        $stream = new Stream($fh);
        return $response
            ->withBody($stream)
            ->withHeader('Content-Type', $file['mime'])
            ->withHeader('Content-Disposition', 'inline');
    }

    public function list(Request $request, Response $response): Response
    {
        // Parse query parameters
        $queryParams = $request->getQueryParams();
        $page = max(1, (int)($queryParams['page'] ?? 1));
        $perPage = max(1, min(100, (int)($queryParams['per_page'] ?? 20))); // Limit to 100 items per page
        $type = $queryParams['type'] ?? null;

        // Validate type parameter
        if ($type !== null && !in_array($type, ['image', 'video', 'document', 'other'], true)) {
            return $this->validationErrorResponse($response, 'Invalid type parameter. Must be one of: image, video, document, other');
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

        $links = (new Links())
            ->setFirst($baseUrl . ($queryString ? '?' . $queryString . '&page=1' : '?page=1'))
            ->setLast($baseUrl . ($queryString ? '?' . $queryString . '&page=' . $totalPages : '?page=' . $totalPages))
            ->setPrev($page > 1 ? $baseUrl . ($queryString ? '?' . $queryString . '&page=' . ($page - 1) : '?page=' . ($page - 1)) : null)
            ->setNext($page < $totalPages ? $baseUrl . ($queryString ? '?' . $queryString . '&page=' . ($page + 1) : '?page=' . ($page + 1)) : null);

        $responseDto = (new MediaListGetResponse200())
            ->setData($items)
            ->setMeta($paginationMeta)
            ->setLinks($links);

        return $this->jsonResponse($response, [
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
        ]);
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $id = (string)($args['id'] ?? '');
        if ($id === '') {
            return $this->validationErrorResponse($response, 'Missing media id');
        }

        $media = new MediaService();

        // Check if file exists first
        $file = $media->findById($id);
        if ($file === null) {
            return $this->notFoundResponse($response, 'File not found');
        }

        // Attempt to delete the file
        $deleted = $media->deleteById($id);
        if (!$deleted) {
            return $this->serverErrorResponse($response, 'Failed to delete file');
        }

        return $this->noContentResponse($response);
    }
}

