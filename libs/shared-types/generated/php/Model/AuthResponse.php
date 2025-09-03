<?php

namespace OpenFileSharing\Dto\Model;

class AuthResponse extends \ArrayObject
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
     * @var AuthResponseData
     */
    protected $data;
    /**
     * 
     *
     * @return AuthResponseData
     */
    public function getData(): AuthResponseData
    {
        return $this->data;
    }
    /**
     * 
     *
     * @param AuthResponseData $data
     *
     * @return self
     */
    public function setData(AuthResponseData $data): self
    {
        $this->initialized['data'] = true;
        $this->data = $data;
        return $this;
    }
}