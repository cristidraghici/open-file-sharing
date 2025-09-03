<?php

namespace OpenFileSharing\Dto\Model;

class MediaListGetResponse200 extends \ArrayObject
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
     * @var list<FileMetadata>
     */
    protected $data;
    /**
     * 
     *
     * @var PaginationMeta
     */
    protected $meta;
    /**
     * 
     *
     * @var Links
     */
    protected $links;
    /**
     * 
     *
     * @return list<FileMetadata>
     */
    public function getData(): array
    {
        return $this->data;
    }
    /**
     * 
     *
     * @param list<FileMetadata> $data
     *
     * @return self
     */
    public function setData(array $data): self
    {
        $this->initialized['data'] = true;
        $this->data = $data;
        return $this;
    }
    /**
     * 
     *
     * @return PaginationMeta
     */
    public function getMeta(): PaginationMeta
    {
        return $this->meta;
    }
    /**
     * 
     *
     * @param PaginationMeta $meta
     *
     * @return self
     */
    public function setMeta(PaginationMeta $meta): self
    {
        $this->initialized['meta'] = true;
        $this->meta = $meta;
        return $this;
    }
    /**
     * 
     *
     * @return Links
     */
    public function getLinks(): Links
    {
        return $this->links;
    }
    /**
     * 
     *
     * @param Links $links
     *
     * @return self
     */
    public function setLinks(Links $links): self
    {
        $this->initialized['links'] = true;
        $this->links = $links;
        return $this;
    }
}