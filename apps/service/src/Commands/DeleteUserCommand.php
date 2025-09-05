<?php

declare(strict_types=1);

namespace App\Commands;

use App\Util\Configuration;
use App\Util\Storage;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Style\SymfonyStyle;

class DeleteUserCommand extends Command
{
    protected static $defaultName = 'user:delete';
    protected static $defaultDescription = 'Delete a user from the system';

    private string $usersFile;

    public function __construct()
    {
        $config = Configuration::load();
        $this->usersFile = Storage::usersCsv($config);
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addArgument('username', InputArgument::OPTIONAL, 'The username to delete')
            ->addOption('file', 'f', InputOption::VALUE_OPTIONAL, 'Path to the users CSV file', $this->usersFile);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $helper = $this->getHelper('question');

        $usersFile = (string)$input->getOption('file');

        if (!is_file($usersFile)) {
            $io->warning(sprintf('Users file not found: %s', $usersFile));
            $io->text('No users to delete.');
            return Command::SUCCESS;
        }

        // Load users from CSV
        $users = [];
        $handle = fopen($usersFile, 'rb');
        if ($handle === false) {
            $io->error(sprintf('Cannot open users file: %s', $usersFile));
            return Command::FAILURE;
        }

        // Skip BOM if exists
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        while (($data = fgetcsv($handle)) !== false) {
            // CSV format: username, role, hashedPassword
            if (!isset($data[0], $data[1], $data[2])) {
                continue;
            }
            $users[] = [
                'username' => (string)$data[0],
                'role' => (string)$data[1],
                'hash' => (string)$data[2],
            ];
        }
        fclose($handle);

        if (count($users) === 0) {
            $io->text('No users to delete.');
            return Command::SUCCESS;
        }

        // Determine target username
        $username = $input->getArgument('username');
        if (!$username) {
            $choices = array_map(static function ($u) {
                return sprintf('%s (%s)', $u['username'], $u['role']);
            }, $users);

            $question = new ChoiceQuestion('Select a user to delete', $choices);
            $selected = $helper->ask($input, $output, $question);

            // Extract username from "username (role)"
            if (preg_match('/^([^ ]+) \(/', (string)$selected, $m)) {
                $username = $m[1];
            }
        }

        if (!$username) {
            $io->error('No username selected.');
            return Command::FAILURE;
        }

        // Filter out the user
        $remaining = array_values(array_filter($users, static function ($u) use ($username) {
            return $u['username'] !== $username;
        }));

        if (count($remaining) === count($users)) {
            $io->warning(sprintf('User "%s" not found.', $username));
            return Command::SUCCESS;
        }

        // Rewrite CSV with remaining users
        $file = fopen($usersFile, 'wb');
        if ($file === false) {
            $io->error(sprintf('Cannot open file "%s" for writing', $usersFile));
            return Command::FAILURE;
        }

        // Write BOM for consistency
        fwrite($file, "\xEF\xBB\xBF");
        foreach ($remaining as $u) {
            fputcsv($file, [$u['username'], $u['role'], $u['hash']]);
        }
        fclose($file);

        $io->success(sprintf('User "%s" has been deleted.', $username));
        $io->note(sprintf('User data updated in: %s', $usersFile));

        return Command::SUCCESS;
    }
}
