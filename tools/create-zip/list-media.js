import chalk from "chalk";
import { exec } from "child_process";
import { resolve } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * List media files using the PHP command
 */
export async function listMedia(options = {}) {
    const { type = null, extensions = null, user = null } = options;

    try {
        // First, let's get a list of all media files by running the PHP command
        // We'll use a simple approach to get the media list
        const phpCommand = "php bin/console.php media:zip temp-list.zip --dry-run 2>/dev/null || echo 'No files found'";

        const { stdout, stderr } = await execAsync(phpCommand, {
            cwd: resolve(process.cwd(), "apps/service"),
        });

        if (stderr && !stderr.includes("dry-run")) {
            console.error(chalk.yellow("Warning:"), stderr);
        }

        // Parse the output to extract file information
        const lines = stdout.split("\n");
        const infoLine = lines.find(line => line.includes("Found") && line.includes("files"));

        if (infoLine) {
            console.log(chalk.blue(infoLine.trim()));
        }

        // Show available filtering options
        console.log(chalk.blue("\nAvailable filtering options:"));
        console.log(chalk.gray("  --type <type>     Filter by file type (image, video, document, other)"));
        console.log(chalk.gray("  --extensions <ext> Filter by file extensions (comma-separated)"));
        console.log(chalk.gray("  --user <user>     Filter by uploaded user"));

        console.log(chalk.blue("\nExample usage:"));
        console.log(chalk.gray("  ofs-zip create my-files.zip --type=image"));
        console.log(chalk.gray("  ofs-zip create docs.zip --extensions=pdf,doc,docx"));
        console.log(chalk.gray("  ofs-zip create user-files.zip --user=john"));

    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error("PHP command not found. Make sure PHP is installed and in your PATH.");
        }
        throw new Error(`Failed to list media: ${error.message}`);
    }
}
