<?php

namespace OpenFileSharing\Dto\Model;

class AuthResponseData extends \ArrayObject
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
    protected $token;
    /**
     * 
     *
     * @var User
     */
    protected $user;
    /**
     * 
     *
     * @return string
     */
    public function getToken(): string
    {
        return $this->token;
    }
    /**
     * 
     *
     * @param string $token
     *
     * @return self
     */
    public function setToken(string $token): self
    {
        $this->initialized['token'] = true;
        $this->token = $token;
        return $this;
    }
    /**
     * 
     *
     * @return User
     */
    public function getUser(): User
    {
        return $this->user;
    }
    /**
     * 
     *
     * @param User $user
     *
     * @return self
     */
    public function setUser(User $user): self
    {
        $this->initialized['user'] = true;
        $this->user = $user;
        return $this;
    }
}