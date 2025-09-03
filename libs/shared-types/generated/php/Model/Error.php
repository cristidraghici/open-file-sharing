<?php

namespace OpenFileSharing\Dto\Model;

class Error extends \ArrayObject
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
     * @var ErrorError
     */
    protected $error;
    /**
     * 
     *
     * @return ErrorError
     */
    public function getError(): ErrorError
    {
        return $this->error;
    }
    /**
     * 
     *
     * @param ErrorError $error
     *
     * @return self
     */
    public function setError(ErrorError $error): self
    {
        $this->initialized['error'] = true;
        $this->error = $error;
        return $this;
    }
}