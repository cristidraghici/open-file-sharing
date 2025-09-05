<?php

declare(strict_types=1);

namespace App\Util;

use OpenFileSharing\Dto\Model\User as UserDto;
use OpenFileSharing\Dto\Model\FileMetadata as FileMetadataDto;

final class Serializer
{
    public static function userToArray(UserDto $user): array
    {
        return [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'role' => $user->getRole(),
        ];
    }

    public static function userToCsvRow(UserDto $user, string $hashedPassword): array
    {
        // CSV format: username, role, hashedPassword
        return [
            $user->getUsername(),
            $user->getRole(),
            $hashedPassword,
        ];
    }

    /**
     * Convert FileMetadata DTO to array matching shared-types schema keys.
     */
    public static function fileMetadataToArray(FileMetadataDto $m): array
    {
        return [
            'id' => $m->getId(),
            'fileName' => $m->getFileName(),
            'fileType' => $m->getFileType(),
            'size' => $m->getSize(),
            'uploadedBy' => $m->getUploadedBy(),
            'uploadedAt' => $m->isInitialized('uploadedAt') ? $m->getUploadedAt()->format(DATE_ATOM) : null,
            'isPublic' => $m->isInitialized('isPublic') ? $m->getIsPublic() : false,
        ];
    }

    /**
     * Convert a list of FileMetadata DTOs to arrays.
     * @param array<int,FileMetadataDto> $items
     * @return array<int,array>
     */
    public static function fileMetadataListToArray(array $items): array
    {
        $out = [];
        foreach ($items as $m) {
            $out[] = self::fileMetadataToArray($m);
        }
        return $out;
    }

    /**
     * Infer shared fileType enum (image|video|document|other) from a MIME type string.
     */
    public static function inferFileTypeFromMime(?string $mime): string
    {
        $m = strtolower((string)$mime);
        if ($m === '') { return 'other'; }
        if (str_starts_with($m, 'image/')) { return 'image'; }
        if (str_starts_with($m, 'video/')) { return 'video'; }
        // Treat common doc types
        if (
            str_starts_with($m, 'application/pdf') ||
            str_starts_with($m, 'application/msword') ||
            str_starts_with($m, 'application/vnd') ||
            str_starts_with($m, 'text/')
        ) {
            return 'document';
        }
        return 'other';
    }
}
