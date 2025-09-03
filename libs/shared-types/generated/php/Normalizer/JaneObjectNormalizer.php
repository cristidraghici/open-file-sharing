<?php

namespace OpenFileSharing\Dto\Normalizer;

use OpenFileSharing\Dto\Runtime\Normalizer\CheckArray;
use OpenFileSharing\Dto\Runtime\Normalizer\ValidatorTrait;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
class JaneObjectNormalizer implements DenormalizerInterface, NormalizerInterface, DenormalizerAwareInterface, NormalizerAwareInterface
{
    use DenormalizerAwareTrait;
    use NormalizerAwareTrait;
    use CheckArray;
    use ValidatorTrait;
    protected $normalizers = [
        
        \OpenFileSharing\Dto\Model\Error::class => \OpenFileSharing\Dto\Normalizer\ErrorNormalizer::class,
        
        \OpenFileSharing\Dto\Model\ErrorError::class => \OpenFileSharing\Dto\Normalizer\ErrorErrorNormalizer::class,
        
        \OpenFileSharing\Dto\Model\LoginRequest::class => \OpenFileSharing\Dto\Normalizer\LoginRequestNormalizer::class,
        
        \OpenFileSharing\Dto\Model\AuthResponse::class => \OpenFileSharing\Dto\Normalizer\AuthResponseNormalizer::class,
        
        \OpenFileSharing\Dto\Model\AuthResponseData::class => \OpenFileSharing\Dto\Normalizer\AuthResponseDataNormalizer::class,
        
        \OpenFileSharing\Dto\Model\User::class => \OpenFileSharing\Dto\Normalizer\UserNormalizer::class,
        
        \OpenFileSharing\Dto\Model\FileMetadata::class => \OpenFileSharing\Dto\Normalizer\FileMetadataNormalizer::class,
        
        \OpenFileSharing\Dto\Model\UploadRequest::class => \OpenFileSharing\Dto\Normalizer\UploadRequestNormalizer::class,
        
        \OpenFileSharing\Dto\Model\PaginationMeta::class => \OpenFileSharing\Dto\Normalizer\PaginationMetaNormalizer::class,
        
        \OpenFileSharing\Dto\Model\Links::class => \OpenFileSharing\Dto\Normalizer\LinksNormalizer::class,
        
        \OpenFileSharing\Dto\Model\AuthMeGetResponse200::class => \OpenFileSharing\Dto\Normalizer\AuthMeGetResponse200Normalizer::class,
        
        \OpenFileSharing\Dto\Model\MediaUploadPostBody::class => \OpenFileSharing\Dto\Normalizer\MediaUploadPostBodyNormalizer::class,
        
        \OpenFileSharing\Dto\Model\MediaUploadPostResponse201::class => \OpenFileSharing\Dto\Normalizer\MediaUploadPostResponse201Normalizer::class,
        
        \OpenFileSharing\Dto\Model\MediaListGetResponse200::class => \OpenFileSharing\Dto\Normalizer\MediaListGetResponse200Normalizer::class,
        
        \OpenFileSharing\Dto\Model\MediaIdGetResponse200::class => \OpenFileSharing\Dto\Normalizer\MediaIdGetResponse200Normalizer::class,
        
        \Jane\Component\JsonSchemaRuntime\Reference::class => \OpenFileSharing\Dto\Runtime\Normalizer\ReferenceNormalizer::class,
    ], $normalizersCache = [];
    public function supportsDenormalization(mixed $data, string $type, ?string $format = null, array $context = []): bool
    {
        return array_key_exists($type, $this->normalizers);
    }
    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return is_object($data) && array_key_exists(get_class($data), $this->normalizers);
    }
    public function normalize(mixed $data, ?string $format = null, array $context = []): array|string|int|float|bool|\ArrayObject|null
    {
        $normalizerClass = $this->normalizers[get_class($data)];
        $normalizer = $this->getNormalizer($normalizerClass);
        return $normalizer->normalize($data, $format, $context);
    }
    public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): mixed
    {
        $denormalizerClass = $this->normalizers[$type];
        $denormalizer = $this->getNormalizer($denormalizerClass);
        return $denormalizer->denormalize($data, $type, $format, $context);
    }
    private function getNormalizer(string $normalizerClass)
    {
        return $this->normalizersCache[$normalizerClass] ?? $this->initNormalizer($normalizerClass);
    }
    private function initNormalizer(string $normalizerClass)
    {
        $normalizer = new $normalizerClass();
        $normalizer->setNormalizer($this->normalizer);
        $normalizer->setDenormalizer($this->denormalizer);
        $this->normalizersCache[$normalizerClass] = $normalizer;
        return $normalizer;
    }
    public function getSupportedTypes(?string $format = null): array
    {
        return [
            
            \OpenFileSharing\Dto\Model\Error::class => false,
            \OpenFileSharing\Dto\Model\ErrorError::class => false,
            \OpenFileSharing\Dto\Model\LoginRequest::class => false,
            \OpenFileSharing\Dto\Model\AuthResponse::class => false,
            \OpenFileSharing\Dto\Model\AuthResponseData::class => false,
            \OpenFileSharing\Dto\Model\User::class => false,
            \OpenFileSharing\Dto\Model\FileMetadata::class => false,
            \OpenFileSharing\Dto\Model\UploadRequest::class => false,
            \OpenFileSharing\Dto\Model\PaginationMeta::class => false,
            \OpenFileSharing\Dto\Model\Links::class => false,
            \OpenFileSharing\Dto\Model\AuthMeGetResponse200::class => false,
            \OpenFileSharing\Dto\Model\MediaUploadPostBody::class => false,
            \OpenFileSharing\Dto\Model\MediaUploadPostResponse201::class => false,
            \OpenFileSharing\Dto\Model\MediaListGetResponse200::class => false,
            \OpenFileSharing\Dto\Model\MediaIdGetResponse200::class => false,
            \Jane\Component\JsonSchemaRuntime\Reference::class => false,
        ];
    }
}