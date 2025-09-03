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
class LinksNormalizer implements DenormalizerInterface, NormalizerInterface, DenormalizerAwareInterface, NormalizerAwareInterface
{
    use DenormalizerAwareTrait;
    use NormalizerAwareTrait;
    use CheckArray;
    use ValidatorTrait;
    public function supportsDenormalization(mixed $data, string $type, ?string $format = null, array $context = []): bool
    {
        return $type === \OpenFileSharing\Dto\Model\Links::class;
    }
    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return is_object($data) && get_class($data) === \OpenFileSharing\Dto\Model\Links::class;
    }
    public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): mixed
    {
        if (isset($data['$ref'])) {
            return new Reference($data['$ref'], $context['document-origin']);
        }
        if (isset($data['$recursiveRef'])) {
            return new Reference($data['$recursiveRef'], $context['document-origin']);
        }
        $object = new \OpenFileSharing\Dto\Model\Links();
        if (null === $data || false === \is_array($data)) {
            return $object;
        }
        if (\array_key_exists('first', $data)) {
            $object->setFirst($data['first']);
            unset($data['first']);
        }
        if (\array_key_exists('last', $data)) {
            $object->setLast($data['last']);
            unset($data['last']);
        }
        if (\array_key_exists('prev', $data) && $data['prev'] !== null) {
            $object->setPrev($data['prev']);
            unset($data['prev']);
        }
        elseif (\array_key_exists('prev', $data) && $data['prev'] === null) {
            $object->setPrev(null);
        }
        if (\array_key_exists('next', $data) && $data['next'] !== null) {
            $object->setNext($data['next']);
            unset($data['next']);
        }
        elseif (\array_key_exists('next', $data) && $data['next'] === null) {
            $object->setNext(null);
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
        if ($data->isInitialized('first') && null !== $data->getFirst()) {
            $dataArray['first'] = $data->getFirst();
        }
        if ($data->isInitialized('last') && null !== $data->getLast()) {
            $dataArray['last'] = $data->getLast();
        }
        if ($data->isInitialized('prev') && null !== $data->getPrev()) {
            $dataArray['prev'] = $data->getPrev();
        }
        if ($data->isInitialized('next') && null !== $data->getNext()) {
            $dataArray['next'] = $data->getNext();
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
        return [\OpenFileSharing\Dto\Model\Links::class => false];
    }
}