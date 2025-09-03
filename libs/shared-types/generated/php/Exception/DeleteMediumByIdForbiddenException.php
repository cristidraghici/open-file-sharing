<?php

namespace OpenFileSharing\Dto\Exception;

class DeleteMediumByIdForbiddenException extends ForbiddenException
{
    /**
     * @var \OpenFileSharing\Dto\Model\Error
     */
    private $error;
    /**
     * @var \Psr\Http\Message\ResponseInterface
     */
    private $response;
    public function __construct(\OpenFileSharing\Dto\Model\Error $error, \Psr\Http\Message\ResponseInterface $response)
    {
        parent::__construct('Not authorized to delete file');
        $this->error = $error;
        $this->response = $response;
    }
    public function getError(): \OpenFileSharing\Dto\Model\Error
    {
        return $this->error;
    }
    public function getResponse(): \Psr\Http\Message\ResponseInterface
    {
        return $this->response;
    }
}