<?php

declare(strict_types=1);

namespace App\Util;

final class Storage
{
    /**
     * Resolve the base storage directory.
     * Priority:
     * 1) $config['app']['storage'] if provided
     * 2) env STORAGE_PATH
     * 3) default to service local .data directory
     */
    public static function basePath(?array $config = null): string
    {
        $path = null;

        if (is_array($config)) {
            $app = $config['app'] ?? null;
            if (is_array($app) && isset($app['storage']) && is_string($app['storage']) && $app['storage'] !== '') {
                $path = $app['storage'];
            }
        }

        if ($path === null || $path === '') {
            $env = getenv('STORAGE_PATH');
            if ($env !== false && $env !== '') {
                $path = $env;
            }
        }

        if ($path === null || $path === '') {
            // Default to the service local .data directory
            $path = __DIR__ . '/../../.data';
        }

        // Normalize and trim trailing separators
        return rtrim($path, DIRECTORY_SEPARATOR);
    }

    /**
     * Path to users.csv file under the base storage directory
     */
    public static function usersCsv(?array $config = null): string
    {
        return self::basePath($config) . DIRECTORY_SEPARATOR . 'users.csv';
    }

    /**
     * Path to uploads directory under the base storage directory
     */
    public static function uploadsDir(?array $config = null): string
    {
        return self::basePath($config) . DIRECTORY_SEPARATOR . 'uploads';
    }
}
