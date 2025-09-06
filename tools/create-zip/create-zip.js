import chalk from "chalk";
import { exec } from "child_process";
import { resolve } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Create a zip file using the PHP command
 */
export async function createZip(outputName, options = {}) {
    const {
        type = null,
        extensions = null,
        user = null,
        includeMetadata = false,
        flat = false,
        noDate = false,
    } = options;

    // Build the PHP command
    const phpCommand = "php bin/console.php media:zip";
    const args = outputName ? [outputName] : [];

    if (type) {
        args.push(`--type=${type}`);
    }

    if (extensions) {
        args.push(`--extensions=${extensions}`);
    }

    if (user) {
        args.push(`--user=${user}`);
    }

    if (includeMetadata) {
        args.push("--include-metadata");
    }

    if (flat) {
        args.push("--flat");
    }

    if (noDate) {
        args.push("--no-date");
    }

    const fullCommand = `${phpCommand} ${args.join(" ")}`;

    try {
        console.log(chalk.blue("Creating zip file..."));
        console.log(chalk.gray(`Command: ${fullCommand}`));

        const { stdout, stderr } = await execAsync(fullCommand, {
            cwd: resolve(process.cwd(), "apps/service"),
        });

        if (stderr) {
            console.error(chalk.yellow("Warning:"), stderr);
        }

        if (stdout) {
            // Parse the output to show a cleaner result
            const lines = stdout.split("\n");
            const infoLine = lines.find(line => line.includes("Found") && line.includes("files"));
            const successLine = lines.find(line => line.includes("Successfully created zip file"));

            if (infoLine) {
                console.log(chalk.blue(infoLine.trim()));
            }

            if (successLine) {
                console.log(chalk.green(successLine.trim()));
            } else {
                // Show all output if no success line found
                console.log(stdout);
            }
        }

        // Check if the file was actually created in .data/zips directory
        const dataZipsPath = resolve(process.cwd(), "apps/service/.data/zips");
        const { readdir, stat } = await import("fs/promises");
        const zipFiles = await readdir(dataZipsPath).catch(() => []);

        // Find the most recent zip file (since we don't know the exact name with date)
        let zipFile = null;
        let mostRecentTime = 0;

        for (const file of zipFiles) {
            if (file.endsWith('.zip')) {
                const filePath = resolve(dataZipsPath, file);
                const stats = await stat(filePath);
                if (stats.mtime.getTime() > mostRecentTime) {
                    mostRecentTime = stats.mtime.getTime();
                    zipFile = file;
                }
            }
        }

        if (zipFile) {
            const fullZipPath = resolve(dataZipsPath, zipFile);
            const { stat } = await import("fs/promises");
            const stats = await stat(fullZipPath);
            const fileSize = formatBytes(stats.size);
            console.log(chalk.green(`✅ Zip file created successfully: .data/zips/${zipFile} (${fileSize})`));
        } else {
            throw new Error("Zip file was not created");
        }

    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error("PHP command not found. Make sure PHP is installed and in your PATH.");
        }
        throw new Error(`Failed to create zip: ${error.message}`);
    }
}

/**
 * Format bytes into human readable format
 */
function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    bytes = Math.max(bytes, 0);
    const pow = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
    const powIndex = Math.min(pow, units.length - 1);
    bytes /= Math.pow(1024, powIndex);
    return Math.round(bytes * 100) / 100 + " " + units[powIndex];
}
