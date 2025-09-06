<?php

namespace OpenFileSharing\Dto\Model;

class MediaUploadsPostBody extends \ArrayObject
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
     * @var list<string>
     */
    protected $files;
    /**
     * 
     *
     * @return list<string>
     */
    public function getFiles(): array
    {
        return $this->files;
    }
    /**
     * 
     *
     * @param list<string> $files
     *
     * @return self
     */
    public function setFiles(array $files): self
    {
        $this->initialized['files'] = true;
        $this->files = $files;
        return $this;
    }
}