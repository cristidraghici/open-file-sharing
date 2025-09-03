<?php

namespace OpenFileSharing\Dto\Model;

class PaginationMeta extends \ArrayObject
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
     * @var int
     */
    protected $page;
    /**
     * 
     *
     * @var int
     */
    protected $perPage;
    /**
     * 
     *
     * @var int
     */
    protected $total;
    /**
     * 
     *
     * @return int
     */
    public function getPage(): int
    {
        return $this->page;
    }
    /**
     * 
     *
     * @param int $page
     *
     * @return self
     */
    public function setPage(int $page): self
    {
        $this->initialized['page'] = true;
        $this->page = $page;
        return $this;
    }
    /**
     * 
     *
     * @return int
     */
    public function getPerPage(): int
    {
        return $this->perPage;
    }
    /**
     * 
     *
     * @param int $perPage
     *
     * @return self
     */
    public function setPerPage(int $perPage): self
    {
        $this->initialized['perPage'] = true;
        $this->perPage = $perPage;
        return $this;
    }
    /**
     * 
     *
     * @return int
     */
    public function getTotal(): int
    {
        return $this->total;
    }
    /**
     * 
     *
     * @param int $total
     *
     * @return self
     */
    public function setTotal(int $total): self
    {
        $this->initialized['total'] = true;
        $this->total = $total;
        return $this;
    }
}