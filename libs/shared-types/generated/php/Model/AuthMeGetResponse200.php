<?php

namespace OpenFileSharing\Dto\Model;

class AuthMeGetResponse200 extends \ArrayObject
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
     * @var User
     */
    protected $data;
    /**
     * 
     *
     * @return User
     */
    public function getData(): User
    {
        return $this->data;
    }
    /**
     * 
     *
     * @param User $data
     *
     * @return self
     */
    public function setData(User $data): self
    {
        $this->initialized['data'] = true;
        $this->data = $data;
        return $this;
    }
}