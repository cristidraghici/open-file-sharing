<?php

namespace OpenFileSharing\Dto\Model;

class FileMetadata extends \ArrayObject
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
    protected $id;
    /**
     * 
     *
     * @var string
     */
    protected $fileName;
    /**
     * 
     *
     * @var string
     */
    protected $fileType;
    /**
     * 
     *
     * @var int
     */
    protected $size;
    /**
     * 
     *
     * @var string
     */
    protected $uploadedBy;
    /**
     * 
     *
     * @var \DateTime
     */
    protected $uploadedAt;
    /**
     * 
     *
     * @var bool
     */
    protected $isPublic = false;
    /**
     * 
     *
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }
    /**
     * 
     *
     * @param string $id
     *
     * @return self
     */
    public function setId(string $id): self
    {
        $this->initialized['id'] = true;
        $this->id = $id;
        return $this;
    }
    /**
     * 
     *
     * @return string
     */
    public function getFileName(): string
    {
        return $this->fileName;
    }
    /**
     * 
     *
     * @param string $fileName
     *
     * @return self
     */
    public function setFileName(string $fileName): self
    {
        $this->initialized['fileName'] = true;
        $this->fileName = $fileName;
        return $this;
    }
    /**
     * 
     *
     * @return string
     */
    public function getFileType(): string
    {
        return $this->fileType;
    }
    /**
     * 
     *
     * @param string $fileType
     *
     * @return self
     */
    public function setFileType(string $fileType): self
    {
        $this->initialized['fileType'] = true;
        $this->fileType = $fileType;
        return $this;
    }
    /**
     * 
     *
     * @return int
     */
    public function getSize(): int
    {
        return $this->size;
    }
    /**
     * 
     *
     * @param int $size
     *
     * @return self
     */
    public function setSize(int $size): self
    {
        $this->initialized['size'] = true;
        $this->size = $size;
        return $this;
    }
    /**
     * 
     *
     * @return string
     */
    public function getUploadedBy(): string
    {
        return $this->uploadedBy;
    }
    /**
     * 
     *
     * @param string $uploadedBy
     *
     * @return self
     */
    public function setUploadedBy(string $uploadedBy): self
    {
        $this->initialized['uploadedBy'] = true;
        $this->uploadedBy = $uploadedBy;
        return $this;
    }
    /**
     * 
     *
     * @return \DateTime
     */
    public function getUploadedAt(): \DateTime
    {
        return $this->uploadedAt;
    }
    /**
     * 
     *
     * @param \DateTime $uploadedAt
     *
     * @return self
     */
    public function setUploadedAt(\DateTime $uploadedAt): self
    {
        $this->initialized['uploadedAt'] = true;
        $this->uploadedAt = $uploadedAt;
        return $this;
    }
    /**
     * 
     *
     * @return bool
     */
    public function getIsPublic(): bool
    {
        return $this->isPublic;
    }
    /**
     * 
     *
     * @param bool $isPublic
     *
     * @return self
     */
    public function setIsPublic(bool $isPublic): self
    {
        $this->initialized['isPublic'] = true;
        $this->isPublic = $isPublic;
        return $this;
    }
}