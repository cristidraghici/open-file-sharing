<?php

namespace OpenFileSharing\Dto\Endpoint;

class GetAuthMe extends \OpenFileSharing\Dto\Runtime\Client\BaseEndpoint implements \OpenFileSharing\Dto\Runtime\Client\Endpoint
{
    use \OpenFileSharing\Dto\Runtime\Client\EndpointTrait;
    public function getMethod(): string
    {
        return 'GET';
    }
    public function getUri(): string
    {
        return '/auth/me';
    }
    public function getBody(\Symfony\Component\Serializer\SerializerInterface $serializer, $streamFactory = null): array
    {
        return [[], null];
    }
    public function getExtraHeaders(): array
    {
        return ['Accept' => ['application/json']];
    }
    /**
     * {@inheritdoc}
     *
     * @throws \OpenFileSharing\Dto\Exception\GetAuthMeUnauthorizedException
     *
     * @return null|\OpenFileSharing\Dto\Model\AuthMeGetResponse200
     */
    protected function transformResponseBody(\Psr\Http\Message\ResponseInterface $response, \Symfony\Component\Serializer\SerializerInterface $serializer, ?string $contentType = null)
    {
        $status = $response->getStatusCode();
        $body = (string) $response->getBody();
        if (is_null($contentType) === false && (200 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            return $serializer->deserialize($body, 'OpenFileSharing\Dto\Model\AuthMeGetResponse200', 'json');
        }
        if (is_null($contentType) === false && (401 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            throw new \OpenFileSharing\Dto\Exception\GetAuthMeUnauthorizedException($serializer->deserialize($body, 'OpenFileSharing\Dto\Model\Error', 'json'), $response);
        }
    }
    public function getAuthenticationScopes(): array
    {
        return ['bearerAuth'];
    }
}