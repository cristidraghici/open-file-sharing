<?php

namespace OpenFileSharing\Dto\Endpoint;

class GetMediumById extends \OpenFileSharing\Dto\Runtime\Client\BaseEndpoint implements \OpenFileSharing\Dto\Runtime\Client\Endpoint
{
    protected $id;
    /**
     * 
     *
     * @param string $id 
     */
    public function __construct(string $id)
    {
        $this->id = $id;
    }
    use \OpenFileSharing\Dto\Runtime\Client\EndpointTrait;
    public function getMethod(): string
    {
        return 'GET';
    }
    public function getUri(): string
    {
        return str_replace(['{id}'], [$this->id], '/media/{id}');
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
     * @throws \OpenFileSharing\Dto\Exception\GetMediumByIdNotFoundException
     *
     * @return null|\OpenFileSharing\Dto\Model\MediaIdGetResponse200
     */
    protected function transformResponseBody(\Psr\Http\Message\ResponseInterface $response, \Symfony\Component\Serializer\SerializerInterface $serializer, ?string $contentType = null)
    {
        $status = $response->getStatusCode();
        $body = (string) $response->getBody();
        if (is_null($contentType) === false && (200 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            return $serializer->deserialize($body, 'OpenFileSharing\Dto\Model\MediaIdGetResponse200', 'json');
        }
        if (is_null($contentType) === false && (404 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            throw new \OpenFileSharing\Dto\Exception\GetMediumByIdNotFoundException($serializer->deserialize($body, 'OpenFileSharing\Dto\Model\Error', 'json'), $response);
        }
    }
    public function getAuthenticationScopes(): array
    {
        return ['bearerAuth'];
    }
}