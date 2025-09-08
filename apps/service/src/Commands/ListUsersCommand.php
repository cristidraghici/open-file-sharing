<?php

declare(strict_types=1);

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ListUsersCommand extends BaseCommand
{
    protected static $defaultName = 'user:list';
    protected static $defaultDescription = 'List all users in the system';

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addOption('file', 'f', InputOption::VALUE_OPTIONAL, 'Path to the users CSV file', $this->getUsersFilePath());
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $usersFile = (string) $input->getOption('file');

        if (!is_file($usersFile)) {
            $this->displayWarning(sprintf('Users file not found: %s', $usersFile));
            $this->io->text('No users found.');
            return Command::SUCCESS;
        }

        $users = $this->readAllUsers($usersFile);

        if (empty($users)) {
            $this->io->text('No users found.');
            return Command::SUCCESS;
        }

        // Convert users to table rows
        $rows = [];
        foreach ($users as $user) {
            $rows[] = [$user['username'], $user['role']];
        }

        $this->io->title('Registered Users');
        $this->io->table(['Username', 'Role'], $rows);
        $this->io->note(sprintf('User data source: %s', $usersFile));

        return Command::SUCCESS;
    }
}
