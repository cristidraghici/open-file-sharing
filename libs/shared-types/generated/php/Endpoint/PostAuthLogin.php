<?php

namespace OpenFileSharing\Dto\Endpoint;

class PostAuthLogin extends \OpenFileSharing\Dto\Runtime\Client\BaseEndpoint implements \OpenFileSharing\Dto\Runtime\Client\Endpoint
{
    /**
     * 
     *
     * @param \OpenFileSharing\Dto\Model\LoginRequest $requestBody 
     */
    public function __construct(\OpenFileSharing\Dto\Model\LoginRequest $requestBody)
    {
        $this->body = $requestBody;
    }
    use \OpenFileSharing\Dto\Runtime\Client\EndpointTrait;
    public function getMethod(): string
    {
        return 'POST';
    }
    public function getUri(): string
    {
        return '/auth/login';
    }
    public function getBody(\Symfony\Component\Serializer\SerializerInterface $serializer, $streamFactory = null): array
    {
        if ($this->body instanceof \OpenFileSharing\Dto\Model\LoginRequest) {
            return [['Content-Type' => ['application/json']], $serializer->serialize($this->body, 'json')];
        }
        return [[], null];
    }
    public function getExtraHeaders(): array
    {
        return ['Accept' => ['application/json']];
    }
    /**
     * {@inheritdoc}
     *
     * @throws \OpenFileSharing\Dto\Exception\PostAuthLoginUnauthorizedException
     *
     * @return null|\OpenFileSharing\Dto\Model\AuthResponse
     */
    protected function transformResponseBody(\Psr\Http\Message\ResponseInterface $response, \Symfony\Component\Serializer\SerializerInterface $serializer, ?string $contentType = null)
    {
        $status = $response->getStatusCode();
        $body = (string) $response->getBody();
        if (is_null($contentType) === false && (200 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            return $serializer->deserialize($body, 'OpenFileSharing\Dto\Model\AuthResponse', 'json');
        }
        if (is_null($contentType) === false && (401 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            throw new \OpenFileSharing\Dto\Exception\PostAuthLoginUnauthorizedException($serializer->deserialize($body, 'OpenFileSharing\Dto\Model\Error', 'json'), $response);
        }
    }
    public function getAuthenticationScopes(): array
    {
        return ['bearerAuth'];
    }
}