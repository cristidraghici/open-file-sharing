<?php

declare(strict_types=1);

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;

class DeleteUserCommand extends BaseCommand
{
    protected static $defaultName = 'user:delete';
    protected static $defaultDescription = 'Delete a user from the system';

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addArgument('username', InputArgument::OPTIONAL, 'The username to delete')
            ->addOption('file', 'f', InputOption::VALUE_OPTIONAL, 'Path to the users CSV file', $this->getUsersFilePath());
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $helper = $this->getHelper('question');
        $usersFile = (string)$input->getOption('file');

        if (!is_file($usersFile)) {
            $this->displayWarning(sprintf('Users file not found: %s', $usersFile));
            $this->io->text('No users to delete.');
            return Command::SUCCESS;
        }

        // Load users from CSV
        $users = $this->readAllUsers($usersFile);

        if (empty($users)) {
            $this->io->text('No users to delete.');
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
            return $this->displayError('No username selected.');
        }

        // Filter out the user
        $remaining = array_values(array_filter($users, static function ($u) use ($username) {
            return $u['username'] !== $username;
        }));

        if (count($remaining) === count($users)) {
            $this->displayWarning(sprintf('User "%s" not found.', $username));
            return Command::SUCCESS;
        }

        // Rewrite CSV with remaining users
        if (!$this->writeUsersToFile($remaining, $usersFile)) {
            return Command::FAILURE;
        }

        $this->displaySuccess(
            sprintf('User "%s" has been deleted.', $username),
            sprintf('User data updated in: %s', $usersFile)
        );

        return Command::SUCCESS;
    }
}
