<?php

declare(strict_types=1);

namespace App\Services;

final class TokenService
{
    private string $secret;
    private int $ttlSeconds;

    public function __construct(?string $secret = null, int $ttlSeconds = 86400)
    {
        $this->secret = $secret ?? (getenv('APP_SECRET') ?: 'dev-secret-change-me');
        $this->ttlSeconds = $ttlSeconds;
    }

    /**
     * Create a compact signed token (not a full JWT, but similar) with HMAC-SHA256
     */
    public function createToken(array $claims): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload = $claims + ['exp' => time() + $this->ttlSeconds, 'iat' => time()];
        $segments = [
            $this->b64(json_encode($header, JSON_UNESCAPED_SLASHES)),
            $this->b64(json_encode($payload, JSON_UNESCAPED_SLASHES)),
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, $this->secret, true);
        $segments[] = $this->b64($signature);
        return implode('.', $segments);
    }

    /**
     * Verify token signature and expiration. Returns payload array on success, null otherwise.
     */
    public function verifyToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        [$h, $p, $s] = $parts;
        $header = json_decode($this->b64d($h), true);
        $payload = json_decode($this->b64d($p), true);
        $signature = $this->b64d($s);
        if (!is_array($header) || !is_array($payload)) {
            return null;
        }
        $expected = hash_hmac('sha256', $h . '.' . $p, $this->secret, true);
        if (!hash_equals($expected, $signature)) {
            return null;
        }
        if (isset($payload['exp']) && time() >= (int)$payload['exp']) {
            return null;
        }
        return $payload;
    }

    private function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function b64d(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}
