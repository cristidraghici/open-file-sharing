<?php

declare(strict_types=1);

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use OpenFileSharing\Dto\Model\User as UserDto;
use App\Util\Serializer;

class AddUserCommand extends BaseCommand
{
    protected static $defaultName = 'user:add';
    protected static $defaultDescription = 'Add a new user to the system';

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addArgument('username', InputArgument::OPTIONAL, 'The username of the user')
            ->addArgument('password', InputArgument::OPTIONAL, 'The password of the user')
            ->addArgument('role', InputArgument::OPTIONAL, 'The role of the user', 'user')
            ->addOption('file', 'f', InputOption::VALUE_OPTIONAL, 'Path to the users CSV file', $this->getUsersFilePath());
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $helper = $this->getHelper('question');

        // Get username
        $username = $input->getArgument('username');
        if (!$username) {
            $question = new Question('Please enter the username: ');
            $username = $helper->ask($input, $output, $question);
        }

        // Validate username
        if (!$this->isValidUsername($username)) {
            return $this->displayError('Username must contain only alphanumeric characters');
        }

        // Get password
        $password = $input->getArgument('password');
        if (!$password) {
            $question = new Question('Please enter the password: ');
            $question->setHidden(true);
            $question->setHiddenFallback(false);
            $password = $helper->ask($input, $output, $question);

            if (empty($password)) {
                return $this->displayError('Password cannot be empty');
            }

            // Confirm password
            $question = new Question('Please confirm the password: ');
            $question->setHidden(true);
            $question->setHiddenFallback(false);
            $confirmPassword = $helper->ask($input, $output, $question);

            if ($password !== $confirmPassword) {
                return $this->displayError('Passwords do not match');
            }
        }

        // Get role
        $role = strtolower($input->getArgument('role'));
        if (!$this->isValidRole($role)) {
            return $this->displayError('Role must be either "admin" or "user"');
        }

        // Get the users file path from options
        $usersFile = $input->getOption('file');

        // Create users directory if it doesn't exist
        $usersDir = dirname($usersFile);
        if (!$this->ensureDirectoryExists($usersDir)) {
            return Command::FAILURE;
        }

        // Check if user already exists
        if ($this->userExists($username, $usersFile)) {
            return $this->displayError(sprintf('User "%s" already exists', $username));
        }

        // Hash the password (using password_hash with PASSWORD_DEFAULT)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Build User DTO from input
        $userDto = (new UserDto())
            ->setId(bin2hex(random_bytes(16)))
            ->setUsername((string)$username)
            ->setRole($role);

        // Save user to CSV file using DTO serialization
        $userData = Serializer::userToCsvRow($userDto, $hashedPassword);

        $fileExists = file_exists($usersFile);
        $file = $this->openCsvForWriting($usersFile, true);

        if ($file === false) {
            return $this->displayError(sprintf('Cannot open file "%s" for writing', $usersFile));
        }

        // Add UTF-8 BOM for Excel compatibility if file is new (handled by openCsvForWriting)
        if (!$fileExists) {
            // BOM already handled by openCsvForWriting method
        }

        fputcsv($file, $userData);
        fclose($file);

        $this->displaySuccess(
            sprintf('User "%s" has been successfully created with role "%s"', $userDto->getUsername(), $role),
            sprintf('User data stored in: %s', $usersFile)
        );

        return Command::SUCCESS;
    }
}
