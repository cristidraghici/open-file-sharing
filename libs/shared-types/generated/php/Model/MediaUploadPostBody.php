<?php

namespace OpenFileSharing\Dto\Model;

class MediaUploadPostBody extends \ArrayObject
{
    /**
     * @var array
     */
    protected $initialized = [];
    public function isInitialized($property): bool
    {
        return array_key_exists($property, $this->initialized);
    }
    /**
     * 
     *
     * @var string
     */
    protected $file;
    /**
     * 
     *
     * @var UploadRequest
     */
    protected $metadata;
    /**
     * 
     *
     * @return string
     */
    public function getFile(): string
    {
        return $this->file;
    }
    /**
     * 
     *
     * @param string $file
     *
     * @return self
     */
    public function setFile(string $file): self
    {
        $this->initialized['file'] = true;
        $this->file = $file;
        return $this;
    }
    /**
     * 
     *
     * @return UploadRequest
     */
    public function getMetadata(): UploadRequest
    {
        return $this->metadata;
    }
    /**
     * 
     *
     * @param UploadRequest $metadata
     *
     * @return self
     */
    public function setMetadata(UploadRequest $metadata): self
    {
        $this->initialized['metadata'] = true;
        $this->metadata = $metadata;
        return $this;
    }
}