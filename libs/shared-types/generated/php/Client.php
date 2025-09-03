<?php

namespace OpenFileSharing\Dto;

class Client extends \OpenFileSharing\Dto\Runtime\Client\Client
{
    /**
     * 
     *
     * @param \OpenFileSharing\Dto\Model\LoginRequest $requestBody 
     * @param string $fetch Fetch mode to use (can be OBJECT or RESPONSE)
     * @throws \OpenFileSharing\Dto\Exception\PostAuthLoginUnauthorizedException
     *
     * @return null|\OpenFileSharing\Dto\Model\AuthResponse|\Psr\Http\Message\ResponseInterface
     */
    public function postAuthLogin(\OpenFileSharing\Dto\Model\LoginRequest $requestBody, string $fetch = self::FETCH_OBJECT)
    {
        return $this->executeEndpoint(new \OpenFileSharing\Dto\Endpoint\PostAuthLogin($requestBody), $fetch);
    }
    /**
     * @param string $fetch Fetch mode to use (can be OBJECT or RESPONSE)
     * @throws \OpenFileSharing\Dto\Exception\GetAuthMeUnauthorizedException
     *
     * @return null|\OpenFileSharing\Dto\Model\AuthMeGetResponse200|\Psr\Http\Message\ResponseInterface
     */
    public function getAuthMe(string $fetch = self::FETCH_OBJECT)
    {
        return $this->executeEndpoint(new \OpenFileSharing\Dto\Endpoint\GetAuthMe(), $fetch);
    }
    /**
     * 
     *
     * @param \OpenFileSharing\Dto\Model\MediaUploadPostBody $requestBody 
     * @param string $fetch Fetch mode to use (can be OBJECT or RESPONSE)
     * @throws \OpenFileSharing\Dto\Exception\PostMediaUploadBadRequestException
     * @throws \OpenFileSharing\Dto\Exception\PostMediaUploadRequestEntityTooLargeException
     *
     * @return null|\OpenFileSharing\Dto\Model\MediaUploadPostResponse201|\Psr\Http\Message\ResponseInterface
     */
    public function postMediaUpload(\OpenFileSharing\Dto\Model\MediaUploadPostBody $requestBody, string $fetch = self::FETCH_OBJECT)
    {
        return $this->executeEndpoint(new \OpenFileSharing\Dto\Endpoint\PostMediaUpload($requestBody), $fetch);
    }
    /**
     * 
     *
     * @param array $queryParameters {
     *     @var int $page 
     *     @var int $per_page 
     *     @var string $type 
     * }
     * @param string $fetch Fetch mode to use (can be OBJECT or RESPONSE)
     *
     * @return null|\OpenFileSharing\Dto\Model\MediaListGetResponse200|\Psr\Http\Message\ResponseInterface
     */
    public function getMediaList(array $queryParameters = [], string $fetch = self::FETCH_OBJECT)
    {
        return $this->executeEndpoint(new \OpenFileSharing\Dto\Endpoint\GetMediaList($queryParameters), $fetch);
    }
    /**
     * 
     *
     * @param string $id 
     * @param string $fetch Fetch mode to use (can be OBJECT or RESPONSE)
     * @throws \OpenFileSharing\Dto\Exception\DeleteMediumByIdNotFoundException
     * @throws \OpenFileSharing\Dto\Exception\DeleteMediumByIdForbiddenException
     *
     * @return null|\Psr\Http\Message\ResponseInterface
     */
    public function deleteMediumById(string $id, string $fetch = self::FETCH_OBJECT)
    {
        return $this->executeEndpoint(new \OpenFileSharing\Dto\Endpoint\DeleteMediumById($id), $fetch);
    }
    /**
     * 
     *
     * @param string $id 
     * @param string $fetch Fetch mode to use (can be OBJECT or RESPONSE)
     * @throws \OpenFileSharing\Dto\Exception\GetMediumByIdNotFoundException
     *
     * @return null|\OpenFileSharing\Dto\Model\MediaIdGetResponse200|\Psr\Http\Message\ResponseInterface
     */
    public function getMediumById(string $id, string $fetch = self::FETCH_OBJECT)
    {
        return $this->executeEndpoint(new \OpenFileSharing\Dto\Endpoint\GetMediumById($id), $fetch);
    }
    public static function create($httpClient = null, array $additionalPlugins = [], array $additionalNormalizers = [])
    {
        if (null === $httpClient) {
            $httpClient = \Http\Discovery\Psr18ClientDiscovery::find();
            $plugins = [];
            $uri = \Http\Discovery\Psr17FactoryDiscovery::findUriFactory()->createUri('/api/v1');
            $plugins[] = new \Http\Client\Common\Plugin\AddPathPlugin($uri);
            if (count($additionalPlugins) > 0) {
                $plugins = array_merge($plugins, $additionalPlugins);
            }
            $httpClient = new \Http\Client\Common\PluginClient($httpClient, $plugins);
        }
        $requestFactory = \Http\Discovery\Psr17FactoryDiscovery::findRequestFactory();
        $streamFactory = \Http\Discovery\Psr17FactoryDiscovery::findStreamFactory();
        $normalizers = [new \Symfony\Component\Serializer\Normalizer\ArrayDenormalizer(), new \OpenFileSharing\Dto\Normalizer\JaneObjectNormalizer()];
        if (count($additionalNormalizers) > 0) {
            $normalizers = array_merge($normalizers, $additionalNormalizers);
        }
        $serializer = new \Symfony\Component\Serializer\Serializer($normalizers, [new \Symfony\Component\Serializer\Encoder\JsonEncoder(new \Symfony\Component\Serializer\Encoder\JsonEncode(), new \Symfony\Component\Serializer\Encoder\JsonDecode(['json_decode_associative' => true]))]);
        return new static($httpClient, $requestFactory, $serializer, $streamFactory);
    }
}