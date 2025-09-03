<?php

namespace OpenFileSharing\Dto\Model;

class MediaUploadPostResponse201 extends \ArrayObject
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
     * @var FileMetadata
     */
    protected $data;
    /**
     * 
     *
     * @return FileMetadata
     */
    public function getData(): FileMetadata
    {
        return $this->data;
    }
    /**
     * 
     *
     * @param FileMetadata $data
     *
     * @return self
     */
    public function setData(FileMetadata $data): self
    {
        $this->initialized['data'] = true;
        $this->data = $data;
        return $this;
    }
}