<?php

declare(strict_types=1);

namespace App\Commands;

use App\Util\Configuration;
use App\Util\Storage;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

abstract class BaseCommand extends Command
{
    protected array $config;
    protected SymfonyStyle $io;
    
    public function __construct()
    {
        $this->config = Configuration::load();
        parent::__construct();
    }

    /**
     * Initialize the command with common setup
     */
    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->io = new SymfonyStyle($input, $output);
        parent::initialize($input, $output);
    }

    /**
     * Get the path to the users CSV file
     */
    protected function getUsersFilePath(): string
    {
        return Storage::usersCsv($this->config);
    }

    /**
     * Get the base data directory path
     */
    protected function getDataDirectory(): string
    {
        return Storage::basePath($this->config);
    }

    /**
     * Get the uploads directory path
     */
    protected function getUploadsDirectory(): string
    {
        return Storage::uploadsDir($this->config);
    }

    /**
     * Ensure a directory exists, creating it if necessary
     */
    protected function ensureDirectoryExists(string $directory): bool
    {
        if (is_dir($directory)) {
            return true;
        }

        if (!mkdir($directory, 0755, true) && !is_dir($directory)) {
            $this->io->error(sprintf('Directory "%s" could not be created', $directory));
            return false;
        }

        return true;
    }

    /**
     * Open a CSV file for reading with BOM support
     * Returns the file handle or false on failure
     * 
     * @return resource|false
     */
    protected function openCsvForReading(string $filePath)
    {
        if (!is_file($filePath)) {
            return false;
        }

        $handle = fopen($filePath, 'rb');
        if ($handle === false) {
            return false;
        }

        // Skip BOM if exists
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        return $handle;
    }

    /**
     * Open a CSV file for writing with BOM
     * 
     * @return resource|false
     */
    protected function openCsvForWriting(string $filePath, bool $append = false)
    {
        $mode = $append ? 'ab' : 'wb';
        $handle = fopen($filePath, $mode);
        
        if ($handle === false) {
            return false;
        }

        // Add UTF-8 BOM for Excel compatibility if not appending or file is new
        if (!$append || !file_exists($filePath) || filesize($filePath) === 0) {
            fwrite($handle, "\xEF\xBB\xBF");
        }

        return $handle;
    }

    /**
     * Read all users from the CSV file
     * Returns an array of user data or empty array if file doesn't exist
     */
    protected function readAllUsers(?string $filePath = null): array
    {
        $filePath = $filePath ?? $this->getUsersFilePath();
        $handle = $this->openCsvForReading($filePath);
        
        if ($handle === false) {
            return [];
        }

        $users = [];
        while (($data = fgetcsv($handle)) !== false) {
            // CSV format: username, role, hashedPassword, [additional fields...]
            if (!isset($data[0], $data[1])) {
                continue;
            }
            
            $users[] = [
                'username' => (string)$data[0],
                'role' => (string)$data[1],
                'hash' => isset($data[2]) ? (string)$data[2] : '',
                'raw_data' => $data
            ];
        }
        
        fclose($handle);
        return $users;
    }

    /**
     * Write users data to CSV file
     */
    protected function writeUsersToFile(array $users, ?string $filePath = null): bool
    {
        $filePath = $filePath ?? $this->getUsersFilePath();
        
        // Ensure directory exists
        $directory = dirname($filePath);
        if (!$this->ensureDirectoryExists($directory)) {
            return false;
        }

        $handle = $this->openCsvForWriting($filePath);
        if ($handle === false) {
            $this->io->error(sprintf('Cannot open file "%s" for writing', $filePath));
            return false;
        }

        foreach ($users as $user) {
            $rowData = $user['raw_data'] ?? [$user['username'], $user['role'], $user['hash']];
            fputcsv($handle, $rowData);
        }

        fclose($handle);
        return true;
    }

    /**
     * Find a user by username
     */
    protected function findUserByUsername(string $username, ?string $filePath = null): ?array
    {
        $users = $this->readAllUsers($filePath);
        
        foreach ($users as $user) {
            if ($user['username'] === $username) {
                return $user;
            }
        }

        return null;
    }

    /**
     * Check if a user exists
     */
    protected function userExists(string $username, ?string $filePath = null): bool
    {
        return $this->findUserByUsername($username, $filePath) !== null;
    }

    /**
     * Validate username format
     */
    protected function isValidUsername(string $username): bool
    {
        return preg_match('/^[a-zA-Z0-9]+$/', $username) === 1;
    }

    /**
     * Validate user role
     */
    protected function isValidRole(string $role): bool
    {
        return in_array(strtolower($role), ['admin', 'user'], true);
    }

    /**
     * Format file size in human readable format
     */
    protected function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Display success message with optional note
     */
    protected function displaySuccess(string $message, ?string $note = null): void
    {
        $this->io->success($message);
        if ($note !== null) {
            $this->io->note($note);
        }
    }

    /**
     * Display error message and return failure code
     */
    protected function displayError(string $message): int
    {
        $this->io->error($message);
        return Command::FAILURE;
    }

    /**
     * Display warning message
     */
    protected function displayWarning(string $message): void
    {
        $this->io->warning($message);
    }

    /**
     * Display info message
     */
    protected function displayInfo(string $message): void
    {
        $this->io->info($message);
    }

    /**
     * Create a backup of a file before modifying it
     */
    protected function createBackup(string $filePath): bool
    {
        if (!is_file($filePath)) {
            return true; // No file to backup
        }

        $backupPath = $filePath . '.backup.' . date('Y-m-d-H-i-s');
        return copy($filePath, $backupPath);
    }

    /**
     * Validate file type for media operations
     */
    protected function isValidFileType(?string $type): bool
    {
        if ($type === null) {
            return true;
        }
        
        return in_array($type, ['image', 'video', 'document', 'other'], true);
    }

    /**
     * Parse comma-separated extensions list
     */
    protected function parseExtensions(?string $extensions): ?array
    {
        if ($extensions === null) {
            return null;
        }

        $extensionList = array_map('trim', explode(',', $extensions));
        $extensionList = array_filter($extensionList, function ($ext) {
            return !empty($ext);
        });

        return empty($extensionList) ? null : $extensionList;
    }
}
