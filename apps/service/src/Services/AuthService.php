<?php

declare(strict_types=1);

namespace App\Services;

final class AuthService
{
    private string $usersFile;

    public function __construct(?string $usersFile = null)
    {
        $this->usersFile = $usersFile ?? (getenv('USERS_CSV_PATH') ?: __DIR__ . '/../../.data/users.csv');
    }

    /**
     * Verify a username/password against the CSV users store.
     */
    public function verifyCredentials(string $username, string $password): ?array
    {
        if (!is_file($this->usersFile)) {
            return null;
        }

        if (($handle = fopen($this->usersFile, 'rb')) === false) {
            return null;
        }

        // Skip BOM if exists
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        while (($data = fgetcsv($handle)) !== false) {
            // CSV format: username, role, hashedPassword
            if (!isset($data[0], $data[1], $data[2])) {
                continue;
            }
            if ($data[0] === $username) {
                $role = $data[1];
                $hashedPassword = $data[2];
                if (password_verify($password, $hashedPassword)) {
                    fclose($handle);
                    return [
                        'id' => $this->uuidFromString($username),
                        'username' => $username,
                        'role' => $role,
                    ];
                }
                fclose($handle);
                return null;
            }
        }
        fclose($handle);
        return null;
    }

    private function uuidFromString(string $value): string
    {
        // Generate a deterministic UUID v4-like from md5 hash of username for demo purposes
        $hash = md5($value);
        return sprintf(
            '%s-%s-4%s-%s%s-%s',
            substr($hash, 0, 8),
            substr($hash, 8, 4),
            substr($hash, 13, 3),
            dechex((hexdec($hash[16]) & 0x3) | 0x8),
            substr($hash, 17, 3),
            substr($hash, 20, 12)
        );
    }
}
