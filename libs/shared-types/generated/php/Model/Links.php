<?php

namespace OpenFileSharing\Dto\Model;

class Links extends \ArrayObject
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
    protected $first;
    /**
     * 
     *
     * @var string
     */
    protected $last;
    /**
     * 
     *
     * @var string|null
     */
    protected $prev;
    /**
     * 
     *
     * @var string|null
     */
    protected $next;
    /**
     * 
     *
     * @return string
     */
    public function getFirst(): string
    {
        return $this->first;
    }
    /**
     * 
     *
     * @param string $first
     *
     * @return self
     */
    public function setFirst(string $first): self
    {
        $this->initialized['first'] = true;
        $this->first = $first;
        return $this;
    }
    /**
     * 
     *
     * @return string
     */
    public function getLast(): string
    {
        return $this->last;
    }
    /**
     * 
     *
     * @param string $last
     *
     * @return self
     */
    public function setLast(string $last): self
    {
        $this->initialized['last'] = true;
        $this->last = $last;
        return $this;
    }
    /**
     * 
     *
     * @return string|null
     */
    public function getPrev(): ?string
    {
        return $this->prev;
    }
    /**
     * 
     *
     * @param string|null $prev
     *
     * @return self
     */
    public function setPrev(?string $prev): self
    {
        $this->initialized['prev'] = true;
        $this->prev = $prev;
        return $this;
    }
    /**
     * 
     *
     * @return string|null
     */
    public function getNext(): ?string
    {
        return $this->next;
    }
    /**
     * 
     *
     * @param string|null $next
     *
     * @return self
     */
    public function setNext(?string $next): self
    {
        $this->initialized['next'] = true;
        $this->next = $next;
        return $this;
    }
}