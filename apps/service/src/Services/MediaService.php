<?php

declare(strict_types=1);

namespace App\Services;

use App\Util\Configuration;
use App\Util\Storage;

final class MediaService
{
    private string $uploadsDir;

    public function __construct(?string $uploadsDir = null)
    {
        $config = Configuration::load();
        $this->uploadsDir = $uploadsDir ?? Storage::uploadsDir($config);
        if (!is_dir($this->uploadsDir)) {
            if (!mkdir($concurrentDirectory = $this->uploadsDir, 0755, true) && !is_dir($concurrentDirectory)) {
                throw new \RuntimeException(sprintf('Directory "%s" was not created', $this->uploadsDir));
            }
        }
    }

    /**
     * Store an uploaded file and return metadata.
     * @param string $clientFilename
     * @param string $streamPath Temporary uploaded file path
     * @param string $uploadedBy Username who uploaded the file
     * @return array{id:string,filename:string,size:int,mime:string}
     */
    public function store(string $clientFilename, string $streamPath, string $uploadedBy = 'unknown'): array
    {
        $id = bin2hex(random_bytes(16));
        $ext = pathinfo($clientFilename, PATHINFO_EXTENSION);
        $safeBase = $this->sanitizeFilename(pathinfo($clientFilename, PATHINFO_FILENAME));
        $finalName = $id . ($ext !== '' ? ('.' . strtolower($ext)) : '');
        $target = $this->uploadsDir . DIRECTORY_SEPARATOR . $finalName;

        if (!@move_uploaded_file($streamPath, $target)) {
            // Fallback for non SAPI envs
            if (!@rename($streamPath, $target)) {
                if (!@copy($streamPath, $target)) {
                    throw new \RuntimeException('Failed to persist uploaded file');
                }
            }
        }

        $size = filesize($target) ?: 0;
        $mime = $this->getMimeType($target);

        // Optionally, save a sidecar metadata file
        @file_put_contents($this->uploadsDir . DIRECTORY_SEPARATOR . $id . '.json', json_encode([
            'id' => $id,
            'filename' => $clientFilename,
            'safeName' => $safeBase,
            'storedAs' => $finalName,
            'size' => $size,
            'mime' => $mime,
            'uploadedAt' => date('c'),
            'uploadedBy' => $uploadedBy,
        ]));

        return [
            'id' => $id,
            'filename' => $clientFilename,
            'size' => (int)$size,
            'mime' => $mime,
        ];
    }

    /**
     * Find a stored file by id and return its path and mime type.
     * @return array{path:string,mime:string}|null
     */
    public function findById(string $id): ?array
    {
        // Prefer metadata file if present
        $metaPath = $this->uploadsDir . DIRECTORY_SEPARATOR . $id . '.json';
        if (is_file($metaPath)) {
            $meta = json_decode((string)file_get_contents($metaPath), true) ?: [];
            $storedAs = $meta['storedAs'] ?? null;
            if ($storedAs && is_file($this->uploadsDir . DIRECTORY_SEPARATOR . $storedAs)) {
                $full = $this->uploadsDir . DIRECTORY_SEPARATOR . $storedAs;
                return [
                    'path' => $full,
                    'mime' => $this->getMimeType($full),
                ];
            }
        }

        // Fallback: scan for files starting with id
        $pattern = $this->uploadsDir . DIRECTORY_SEPARATOR . $id . '.*';
        $matches = glob($pattern) ?: [];
        foreach ($matches as $file) {
            if (is_file($file)) {
                return [
                    'path' => $file,
                    'mime' => $this->getMimeType($file),
                ];
            }
        }

        return null;
    }

    /**
     * List metadata for all stored media.
     * @return array<int,array{id:string,filename:string,size:int,mime:string,uploadedAt?:string|null}>
     */
    public function listAll(): array
    {
        $items = [];

        if (!is_dir($this->uploadsDir)) {
            return $items;
        }

        // 1) Prefer sidecar JSON metadata files
        foreach (glob($this->uploadsDir . DIRECTORY_SEPARATOR . '*.json') ?: [] as $metaFile) {
            if (!is_file($metaFile)) {
                continue;
            }
            $meta = json_decode((string)file_get_contents($metaFile), true) ?: [];
            $id = (string)($meta['id'] ?? pathinfo($metaFile, PATHINFO_FILENAME));
            $filename = (string)($meta['filename'] ?? ($meta['storedAs'] ?? 'file'));
            $storedAs = (string)($meta['storedAs'] ?? ($id));
            $filePath = $this->uploadsDir . DIRECTORY_SEPARATOR . $storedAs;
            if (!is_file($filePath)) {
                // If the stored file is missing, skip this entry
                continue;
            }
            $size = filesize($filePath) ?: (int)($meta['size'] ?? 0);
            $mime = $this->getMimeType($filePath);
            $items[] = [
                'id' => $id,
                'filename' => $filename,
                'size' => (int)$size,
                'mime' => $mime,
                'uploadedAt' => $meta['uploadedAt'] ?? null,
                'uploadedBy' => $meta['uploadedBy'] ?? 'unknown',
            ];
        }

        // 2) Also scan any files without sidecar metadata (exclude .json)
        foreach (glob($this->uploadsDir . DIRECTORY_SEPARATOR . '*') ?: [] as $file) {
            if (!is_file($file)) {
                continue;
            }
            if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'json') {
                continue; // already handled via metadata
            }

            $basename = basename($file);
            $id = pathinfo($basename, PATHINFO_FILENAME);
            // Skip if already included via metadata pass
            $already = false;
            foreach ($items as $it) {
                if ($it['id'] === $id) {
                    $already = true;
                    break;
                }
            }
            if ($already) {
                continue;
            }

            $items[] = [
                'id' => $id,
                'filename' => $basename,
                'size' => (int)(filesize($file) ?: 0),
                'mime' => $this->getMimeType($file),
                'uploadedBy' => 'unknown',
                'uploadedAt' => date('c', filemtime($file) ?: time()),
            ];
        }

        // Sort by uploadedAt desc when available, otherwise by filename desc
        usort($items, function ($a, $b) {
            $aTime = isset($a['uploadedAt']) && $a['uploadedAt'] ? strtotime((string)$a['uploadedAt']) : 0;
            $bTime = isset($b['uploadedAt']) && $b['uploadedAt'] ? strtotime((string)$b['uploadedAt']) : 0;
            if ($aTime !== $bTime) {
                return $bTime <=> $aTime;
            }
            return strcmp((string)$b['filename'], (string)$a['filename']);
        });

        return $items;
    }

    /**
     * List metadata for stored media with pagination and filtering.
     * @param int $page Page number (1-based)
     * @param int $perPage Items per page
     * @param string|null $type Filter by file type (image, video, document, other)
     * @return array{items:array<int,array{id:string,filename:string,size:int,mime:string,uploadedAt?:string|null,uploadedBy?:string}>,total:int,page:int,per_page:int}
     */
    public function listPaginated(int $page = 1, int $perPage = 20, ?string $type = null): array
    {
        $allItems = $this->listAll();

        // Filter by type if specified
        if ($type !== null) {
            $allItems = array_filter($allItems, function ($item) use ($type) {
                $mime = $item['mime'] ?? '';
                return $this->matchesFileType($mime, $type);
            });
        }

        $total = count($allItems);
        $offset = ($page - 1) * $perPage;
        $items = array_slice($allItems, $offset, $perPage);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ];
    }

    /**
     * Check if a MIME type matches the specified file type.
     */
    private function matchesFileType(string $mime, string $type): bool
    {
        switch ($type) {
            case 'image':
                return str_starts_with($mime, 'image/');
            case 'video':
                return str_starts_with($mime, 'video/');
            case 'document':
                return in_array($mime, [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain',
                    'text/csv',
                ], true);
            case 'other':
                return !str_starts_with($mime, 'image/') &&
                    !str_starts_with($mime, 'video/') &&
                    !in_array($mime, [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'text/plain',
                        'text/csv',
                    ], true);
            default:
                return false;
        }
    }

    private function sanitizeFilename(string $name): string
    {
        $name = preg_replace('/[^a-zA-Z0-9-_]+/', '-', $name) ?? '';
        $name = trim($name, '-');
        if ($name === '') {
            $name = 'file';
        }
        return strtolower($name);
    }

    /**
     * Get MIME type with fallback when fileinfo extension is not available
     */
    private function getMimeType(string $filePath): string
    {
        if (function_exists('mime_content_type')) {
            $mime = mime_content_type($filePath);
            if ($mime !== false) {
                return $mime;
            }
        }

        // Fallback: determine MIME type by file extension
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeMap = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'wmv' => 'video/x-ms-wmv',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt' => 'text/plain',
            'csv' => 'text/csv',
            'zip' => 'application/zip',
            'json' => 'application/json',
        ];

        return $mimeMap[$extension] ?? 'application/octet-stream';
    }
}
