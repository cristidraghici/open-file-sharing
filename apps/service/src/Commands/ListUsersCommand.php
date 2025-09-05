<?php

declare(strict_types=1);

namespace App\Commands;

use App\Util\Configuration;
use App\Util\Storage;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ListUsersCommand extends Command
{
    protected static $defaultName = 'user:list';
    protected static $defaultDescription = 'List all users in the system';

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
            ->addOption('file', 'f', InputOption::VALUE_OPTIONAL, 'Path to the users CSV file', $this->usersFile);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $usersFile = (string) $input->getOption('file');

        if (!is_file($usersFile)) {
            $io->warning(sprintf('Users file not found: %s', $usersFile));
            $io->text('No users found.');
            return Command::SUCCESS;
        }

        $rows = [];
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
            if (!isset($data[0], $data[1])) {
                continue;
            }
            $username = (string) $data[0];
            $role = (string) $data[1];
            $rows[] = [$username, $role];
        }
        fclose($handle);

        if (count($rows) === 0) {
            $io->text('No users found.');
            return Command::SUCCESS;
        }

        $io->title('Registered Users');
        $io->table(['Username', 'Role'], $rows);
        $io->note(sprintf('User data source: %s', $usersFile));

        return Command::SUCCESS;
    }
}
