<?php

namespace OpenFileSharing\Dto\Endpoint;

class DeleteMediumById extends \OpenFileSharing\Dto\Runtime\Client\BaseEndpoint implements \OpenFileSharing\Dto\Runtime\Client\Endpoint
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
        return 'DELETE';
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
     * @throws \OpenFileSharing\Dto\Exception\DeleteMediumByIdNotFoundException
     * @throws \OpenFileSharing\Dto\Exception\DeleteMediumByIdForbiddenException
     *
     * @return null
     */
    protected function transformResponseBody(\Psr\Http\Message\ResponseInterface $response, \Symfony\Component\Serializer\SerializerInterface $serializer, ?string $contentType = null)
    {
        $status = $response->getStatusCode();
        $body = (string) $response->getBody();
        if (204 === $status) {
            return null;
        }
        if (is_null($contentType) === false && (404 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            throw new \OpenFileSharing\Dto\Exception\DeleteMediumByIdNotFoundException($serializer->deserialize($body, 'OpenFileSharing\Dto\Model\Error', 'json'), $response);
        }
        if (is_null($contentType) === false && (403 === $status && mb_strpos($contentType, 'application/json') !== false)) {
            throw new \OpenFileSharing\Dto\Exception\DeleteMediumByIdForbiddenException($serializer->deserialize($body, 'OpenFileSharing\Dto\Model\Error', 'json'), $response);
        }
    }
    public function getAuthenticationScopes(): array
    {
        return ['bearerAuth'];
    }
}