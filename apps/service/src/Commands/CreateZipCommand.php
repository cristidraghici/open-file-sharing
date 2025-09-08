<?php

declare(strict_types=1);

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Output\OutputInterface;
use App\Services\MediaService;

class CreateZipCommand extends BaseCommand
{
    private string $uploadsDir;
    private MediaService $mediaService;

    protected static $defaultName = 'media:zip';
    protected static $defaultDescription = 'Create a zip file of all media files or files of certain types';

    public function __construct(?string $uploadsDir = null)
    {
        parent::__construct();
        
        $this->uploadsDir = $uploadsDir ?? $this->getUploadsDirectory();
        $this->mediaService = new MediaService($this->uploadsDir);
    }

    protected function configure(): void
    {
        $this
            ->setDescription(self::$defaultDescription)
            ->addArgument('output', InputArgument::OPTIONAL, 'Output zip file name (without extension, date will be added automatically)')
            ->addOption('type', 't', InputOption::VALUE_OPTIONAL, 'Filter by file type (image, video, document, other)', null)
            ->addOption('extensions', 'e', InputOption::VALUE_OPTIONAL, 'Filter by file extensions (comma-separated, e.g., jpg,png,pdf)', null)
            ->addOption('user', 'u', InputOption::VALUE_OPTIONAL, 'Filter by uploaded user', null)
            ->addOption('include-metadata', 'm', InputOption::VALUE_NONE, 'Include metadata JSON files in the zip')
            ->addOption('flat', 'f', InputOption::VALUE_NONE, 'Flatten directory structure (all files in root of zip)')
            ->addOption('no-date', 'd', InputOption::VALUE_NONE, 'Do not include date in the zip file name')
            ->setHelp('
This command creates a zip file containing media files from the uploads directory.
Files are stored in the .data/zips directory with automatic date suffixes.

Examples:
  # Create zip with all files (default name with date)
  php bin/console.php media:zip

  # Create zip with custom name and date
  php bin/console.php media:zip my-files

  # Create zip with only images
  php bin/console.php media:zip images --type=image

  # Create zip with specific extensions
  php bin/console.php media:zip documents --extensions=pdf,doc,docx

  # Create zip with files from specific user
  php bin/console.php media:zip user-files --user=john

  # Create zip with flattened structure
  php bin/console.php media:zip flat-files --flat

  # Create zip including metadata files
  php bin/console.php media:zip with-metadata --include-metadata

  # Create zip without date suffix
  php bin/console.php media:zip static-name --no-date
            ');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $outputName = $input->getArgument('output') ?? 'media-files';
        $type = $input->getOption('type');
        $extensions = $input->getOption('extensions');
        $user = $input->getOption('user');
        $includeMetadata = $input->getOption('include-metadata');
        $flat = $input->getOption('flat');
        $noDate = $input->getOption('no-date');

        // Create the zips directory in .data folder
        $dataDir = $this->getDataDirectory();
        $zipsDir = $dataDir . DIRECTORY_SEPARATOR . 'zips';

        if (!$this->ensureDirectoryExists($zipsDir)) {
            return Command::FAILURE;
        }

        // Generate filename with date
        $dateSuffix = $noDate ? '' : '_' . date('Y-m-d_H-i-s');
        $outputPath = $zipsDir . DIRECTORY_SEPARATOR . $outputName . $dateSuffix . '.zip';

        // Validate type parameter
        if (!$this->isValidFileType($type)) {
            return $this->displayError('Invalid type parameter. Must be one of: image, video, document, other');
        }

        // Parse extensions if provided
        $extensionList = $this->parseExtensions($extensions);
        if ($extensions !== null && $extensionList === null) {
            return $this->displayError('No valid extensions provided');
        }

        // Get all media files
        $allFiles = $this->mediaService->listAll();

        // Filter files based on criteria
        $filteredFiles = $this->filterFiles($allFiles, $type, $extensionList, $user);

        if (empty($filteredFiles)) {
            $this->displayWarning('No files found matching the specified criteria');
            return Command::SUCCESS;
        }

        $this->displayInfo(sprintf('Found %d files to include in zip', count($filteredFiles)));

        // Create zip file
        $zip = new \ZipArchive();
        $result = $zip->open($outputPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        if ($result !== true) {
            return $this->displayError(sprintf('Cannot create zip file: %s (Error code: %d)', $outputPath, $result));
        }

        $addedFiles = 0;
        $errors = [];

        foreach ($filteredFiles as $file) {
            $filePath = $this->uploadsDir . DIRECTORY_SEPARATOR . $file['id'] . '.*';
            $matches = glob($filePath);

            if (empty($matches)) {
                $errors[] = sprintf('File not found: %s', $file['filename']);
                continue;
            }

            $actualFilePath = $matches[0];
            $originalFilename = $file['filename'];

            // Determine the path within the zip
            if ($flat) {
                $zipPath = $originalFilename;
            } else {
                $zipPath = $originalFilename;
            }

            // Add file to zip
            if ($zip->addFile($actualFilePath, $zipPath)) {
                $addedFiles++;
                $this->io->writeln(sprintf('Added: %s', $originalFilename));
            } else {
                $errors[] = sprintf('Failed to add file: %s', $originalFilename);
            }

            // Add metadata file if requested
            if ($includeMetadata) {
                $metadataPath = $this->uploadsDir . DIRECTORY_SEPARATOR . $file['id'] . '.json';
                if (is_file($metadataPath)) {
                    $metadataZipPath = $flat ?
                        $file['id'] . '.json' :
                        'metadata' . DIRECTORY_SEPARATOR . $file['id'] . '.json';

                    if ($zip->addFile($metadataPath, $metadataZipPath)) {
                        $this->io->writeln(sprintf('Added metadata: %s', $file['id'] . '.json'));
                    }
                }
            }
        }

        $zip->close();

        if (!empty($errors)) {
            $this->displayWarning(sprintf('Encountered %d errors:', count($errors)));
            foreach ($errors as $error) {
                $this->io->writeln(sprintf('  - %s', $error));
            }
        }

        if ($addedFiles > 0) {
            $fileSize = filesize($outputPath);
            $relativePath = '.data/zips/' . basename($outputPath);
            $this->displaySuccess(sprintf(
                'Successfully created zip file: %s (%d files, %s)',
                $relativePath,
                $addedFiles,
                $this->formatBytes($fileSize)
            ));
        } else {
            return $this->displayError('No files were added to the zip');
        }

        return Command::SUCCESS;
    }

    /**
     * Filter files based on type, extensions, and user criteria
     */
    private function filterFiles(array $files, ?string $type, ?array $extensions, ?string $user): array
    {
        return array_filter($files, function ($file) use ($type, $extensions, $user) {
            // Filter by type
            if ($type !== null) {
                $mime = $file['mime'] ?? '';
                if (!$this->matchesFileType($mime, $type)) {
                    return false;
                }
            }

            // Filter by extensions
            if ($extensions !== null) {
                $fileExt = strtolower(pathinfo($file['filename'], PATHINFO_EXTENSION));
                if (!in_array($fileExt, $extensions, true)) {
                    return false;
                }
            }

            // Filter by user
            if ($user !== null) {
                $uploadedBy = $file['uploadedBy'] ?? 'unknown';
                if ($uploadedBy !== $user) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Check if a MIME type matches the specified file type
     */
    private function matchesFileType(string $mime, string $type): bool
    {
        switch ($type) {
            case 'image':
                return str_starts_with($mime, 'image/');
            case 'video':
                return str_starts_with($mime, 'video/');
            case 'document':
                return in_array($mime, [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain',
                    'text/csv',
                ], true);
            case 'other':
                return !str_starts_with($mime, 'image/') &&
                    !str_starts_with($mime, 'video/') &&
                    !in_array($mime, [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'text/plain',
                        'text/csv',
                    ], true);
            default:
                return false;
        }
    }

}
