<?php

declare(strict_types=1);

namespace App\Util;

use OpenFileSharing\Dto\Model\User as UserDto;

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
}
