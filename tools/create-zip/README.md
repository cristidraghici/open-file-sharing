# Open File Sharing - Zip Creation Tool

A Node.js CLI tool for creating zip files of media files from the Open File Sharing service.

## Features

- Create zip files containing all media files or filtered subsets
- Filter by file type (image, video, document, other)
- Filter by file extensions (comma-separated)
- Filter by uploaded user
- Include metadata JSON files
- Flatten directory structure
- Interactive mode for easy use

## Installation

The tool is already set up in the project. Dependencies are installed via npm.

## Usage

### Command Line Interface

```bash
# From project root
node tools/create-zip/cli.js --help

# Create zip with all files (default name with date)
node tools/create-zip/cli.js create

# Create zip with custom name and date
node tools/create-zip/cli.js create my-files

# Create zip with only images
node tools/create-zip/cli.js create images --type=image

# Create zip with specific extensions
node tools/create-zip/cli.js create documents --extensions=pdf,doc,docx

# Create zip with files from specific user
node tools/create-zip/cli.js create user-files --user=john

# Create zip with flattened structure
node tools/create-zip/cli.js create flat-files --flat

# Create zip including metadata files
node tools/create-zip/cli.js create with-metadata --include-metadata

# Create zip without date suffix
node tools/create-zip/cli.js create static-name --no-date
```

### Interactive Mode

```bash
# From project root
node tools/create-zip/index.js
```

This will launch an interactive menu where you can:

- Create zip files with guided prompts
- List available media files
- Choose filtering options step by step

## Options

- `--type <type>` - Filter by file type (image, video, document, other)
- `--extensions <extensions>` - Filter by file extensions (comma-separated, e.g., jpg,png,pdf)
- `--user <user>` - Filter by uploaded user
- `--include-metadata` - Include metadata JSON files in the zip
- `--flat` - Flatten directory structure (all files in root of zip)
- `--no-date` - Do not include date in the zip file name

## Requirements

- Node.js >= 18
- PHP with the service running
- The Open File Sharing service must be accessible

## How it Works

The tool wraps the PHP `media:zip` command from the service application, providing a more user-friendly interface with better error handling and output formatting.

## File Storage

- Zip files are automatically stored in the `.data/zips/` directory
- Filenames include automatic date suffixes (e.g., `my-files_2024-01-15_14-30-25.zip`)
- Use `--no-date` option to skip the date suffix
- The tool automatically creates the zips directory if it doesn't exist
