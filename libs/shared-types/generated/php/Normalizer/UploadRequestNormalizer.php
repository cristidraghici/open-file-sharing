<?php

namespace OpenFileSharing\Dto\Normalizer;

use Jane\Component\JsonSchemaRuntime\Reference;
use OpenFileSharing\Dto\Runtime\Normalizer\CheckArray;
use OpenFileSharing\Dto\Runtime\Normalizer\ValidatorTrait;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\DenormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
class UploadRequestNormalizer implements DenormalizerInterface, NormalizerInterface, DenormalizerAwareInterface, NormalizerAwareInterface
{
    use DenormalizerAwareTrait;
    use NormalizerAwareTrait;
    use CheckArray;
    use ValidatorTrait;
    public function supportsDenormalization(mixed $data, string $type, ?string $format = null, array $context = []): bool
    {
        return $type === \OpenFileSharing\Dto\Model\UploadRequest::class;
    }
    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return is_object($data) && get_class($data) === \OpenFileSharing\Dto\Model\UploadRequest::class;
    }
    public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): mixed
    {
        if (isset($data['$ref'])) {
            return new Reference($data['$ref'], $context['document-origin']);
        }
        if (isset($data['$recursiveRef'])) {
            return new Reference($data['$recursiveRef'], $context['document-origin']);
        }
        $object = new \OpenFileSharing\Dto\Model\UploadRequest();
        if (\array_key_exists('isPublic', $data) && \is_int($data['isPublic'])) {
            $data['isPublic'] = (bool) $data['isPublic'];
        }
        if (null === $data || false === \is_array($data)) {
            return $object;
        }
        if (\array_key_exists('fileName', $data)) {
            $object->setFileName($data['fileName']);
            unset($data['fileName']);
        }
        if (\array_key_exists('fileType', $data)) {
            $object->setFileType($data['fileType']);
            unset($data['fileType']);
        }
        if (\array_key_exists('size', $data)) {
            $object->setSize($data['size']);
            unset($data['size']);
        }
        if (\array_key_exists('isPublic', $data)) {
            $object->setIsPublic($data['isPublic']);
            unset($data['isPublic']);
        }
        foreach ($data as $key => $value) {
            if (preg_match('/.*/', (string) $key)) {
                $object[$key] = $value;
            }
        }
        return $object;
    }
    public function normalize(mixed $data, ?string $format = null, array $context = []): array|string|int|float|bool|\ArrayObject|null
    {
        $dataArray = [];
        $dataArray['fileName'] = $data->getFileName();
        $dataArray['fileType'] = $data->getFileType();
        $dataArray['size'] = $data->getSize();
        if ($data->isInitialized('isPublic') && null !== $data->getIsPublic()) {
            $dataArray['isPublic'] = $data->getIsPublic();
        }
        foreach ($data as $key => $value) {
            if (preg_match('/.*/', (string) $key)) {
                $dataArray[$key] = $value;
            }
        }
        return $dataArray;
    }
    public function getSupportedTypes(?string $format = null): array
    {
        return [\OpenFileSharing\Dto\Model\UploadRequest::class => false];
    }
}