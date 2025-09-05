<?php

declare(strict_types=1);

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use OpenFileSharing\Dto\Model\User as UserDto;

class AddUserCommand extends Command
{
    private string $usersFile;

    protected static $defaultName = 'user:add';
    protected static $defaultDescription = 'Add a new user to the system';

    public function __construct(string $usersFile = null)
    {
        $this->usersFile = $usersFile ?? getenv('USERS_CSV_PATH') ?: __DIR__ . '/../../.data/users.csv';

        // Ensure the directory exists
        $dir = dirname($this->usersFile);
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new \RuntimeException(sprintf('Could not create directory "%s"', $dir));
            }
        }

        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addArgument('username', InputArgument::OPTIONAL, 'The username of the user')
            ->addArgument('password', InputArgument::OPTIONAL, 'The password of the user')
            ->addArgument('role', InputArgument::OPTIONAL, 'The role of the user', 'user')
            ->addOption('file', 'f', InputOption::VALUE_OPTIONAL, 'Path to the users CSV file', $this->usersFile);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $helper = $this->getHelper('question');

        // Get username
        $username = $input->getArgument('username');
        if (!$username) {
            $question = new Question('Please enter the username: ');
            $username = $helper->ask($input, $output, $question);
        }

        // Validate username
        if (!preg_match('/^[a-zA-Z0-9]+$/', $username)) {
            $io->error('Username must contain only alphanumeric characters');
            return Command::FAILURE;
        }

        // Get password
        $password = $input->getArgument('password');
        if (!$password) {
            $question = new Question('Please enter the password: ');
            $question->setHidden(true);
            $question->setHiddenFallback(false);
            $password = $helper->ask($input, $output, $question);

            if (empty($password)) {
                $io->error('Password cannot be empty');
                return Command::FAILURE;
            }

            // Confirm password
            $question = new Question('Please confirm the password: ');
            $question->setHidden(true);
            $question->setHiddenFallback(false);
            $confirmPassword = $helper->ask($input, $output, $question);

            if ($password !== $confirmPassword) {
                $io->error('Passwords do not match');
                return Command::FAILURE;
            }
        }

        // Get role
        $role = strtolower($input->getArgument('role'));
        if (!in_array($role, ['admin', 'user'], true)) {
            $io->error('Role must be either "admin" or "user"');
            return Command::FAILURE;
        }

        // Get the users file path from options
        $usersFile = $input->getOption('file');

        // Create users directory if it doesn't exist
        $usersDir = dirname($usersFile);
        if (!is_dir($usersDir)) {
            if (!mkdir($usersDir, 0755, true) && !is_dir($usersDir)) {
                $io->error(sprintf('Directory "%s" was not created', $usersDir));
                return Command::FAILURE;
            }
        }

        // Check if user already exists
        if (file_exists($usersFile)) {
            if (($handle = fopen($usersFile, 'rb')) !== false) {
                // Skip BOM if exists
                $bom = fread($handle, 3);
                if ($bom !== "\xEF\xBB\xBF") {
                    rewind($handle);
                }

                while (($data = fgetcsv($handle)) !== false) {
                    if (isset($data[0]) && $data[0] === $username) {
                        fclose($handle);
                        $io->error(sprintf('User "%s" already exists', $username));
                        return Command::FAILURE;
                    }
                }
                fclose($handle);
            }
        }

        // Hash the password (using password_hash with PASSWORD_DEFAULT)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Build User DTO from input
        $userDto = (new UserDto())
            ->setId(bin2hex(random_bytes(16)))
            ->setUsername((string)$username)
            ->setRoles([$role]);

        // Save user to CSV file
        $userData = [
            $userDto->getUsername(),
            $role,
            $hashedPassword
        ];

        $fileExists = file_exists($usersFile);
        $file = fopen($usersFile, 'ab');

        if ($file === false) {
            $io->error(sprintf('Cannot open file "%s" for writing', $usersFile));
            return Command::FAILURE;
        }

        // Add UTF-8 BOM for Excel compatibility if file is new
        if (!$fileExists) {
            fwrite($file, "\xEF\xBB\xBF");
        }

        fputcsv($file, $userData);
        fclose($file);

        $io->success(sprintf('User "%s" has been successfully created with role "%s"', $userDto->getUsername(), $role));
        $io->note(sprintf('User data stored in: %s', $usersFile));

        return Command::SUCCESS;
    }
}
