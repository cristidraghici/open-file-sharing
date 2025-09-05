<?php

declare(strict_types=1);

namespace App\Util;

final class Configuration
{
    /**
     * Load the service config array from config.php if present.
     * Returns null if the file doesn't exist or doesn't return an array.
     */
    public static function load(): ?array
    {
        $path = __DIR__ . '/../../config.php';
        if (is_file($path)) {
            $cfg = require $path;
            if (is_array($cfg)) {
                return $cfg;
            }
        }
        return null;
    }
}
