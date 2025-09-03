<?php

namespace OpenFileSharing\Dto\Model;

class ErrorError extends \ArrayObject
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
    protected $code;
    /**
     * 
     *
     * @var string
     */
    protected $message;
    /**
     * 
     *
     * @var array<string, mixed>
     */
    protected $details;
    /**
     * 
     *
     * @return string
     */
    public function getCode(): string
    {
        return $this->code;
    }
    /**
     * 
     *
     * @param string $code
     *
     * @return self
     */
    public function setCode(string $code): self
    {
        $this->initialized['code'] = true;
        $this->code = $code;
        return $this;
    }
    /**
     * 
     *
     * @return string
     */
    public function getMessage(): string
    {
        return $this->message;
    }
    /**
     * 
     *
     * @param string $message
     *
     * @return self
     */
    public function setMessage(string $message): self
    {
        $this->initialized['message'] = true;
        $this->message = $message;
        return $this;
    }
    /**
     * 
     *
     * @return array<string, mixed>
     */
    public function getDetails(): iterable
    {
        return $this->details;
    }
    /**
     * 
     *
     * @param array<string, mixed> $details
     *
     * @return self
     */
    public function setDetails(iterable $details): self
    {
        $this->initialized['details'] = true;
        $this->details = $details;
        return $this;
    }
}