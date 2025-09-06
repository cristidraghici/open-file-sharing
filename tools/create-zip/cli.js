#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { readFile } from "fs/promises";
import { createZip } from "./create-zip.js";
import { listMedia } from "./list-media.js";

const packageJson = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url))
);
const { version } = packageJson;

// Display banner
console.log(
    chalk.blue(figlet.textSync("OFS Zip Tool", { horizontalLayout: "full" }))
);

const program = new Command();

program
    .name("ofs-zip")
    .description("Open File Sharing Zip Creation CLI")
    .version(version);

program
    .command("create")
    .description("Create a zip file of media files")
    .argument("[output]", "Output zip file name (without extension, date will be added automatically)")
    .option("-t, --type <type>", "Filter by file type (image, video, document, other)")
    .option("-e, --extensions <extensions>", "Filter by file extensions (comma-separated, e.g., jpg,png,pdf)")
    .option("-u, --user <user>", "Filter by uploaded user")
    .option("-m, --include-metadata", "Include metadata JSON files in the zip")
    .option("-f, --flat", "Flatten directory structure (all files in root of zip)")
    .option("-d, --no-date", "Do not include date in the zip file name")
    .action(async (output, options) => {
        try {
            await createZip(output, options);
        } catch (error) {
            console.error(chalk.red("Error:"), error.message);
            process.exit(1);
        }
    });

program
    .command("list")
    .description("List available media files")
    .option("-t, --type <type>", "Filter by file type (image, video, document, other)")
    .option("-e, --extensions <extensions>", "Filter by file extensions (comma-separated)")
    .option("-u, --user <user>", "Filter by uploaded user")
    .action(async (options) => {
        try {
            await listMedia(options);
        } catch (error) {
            console.error(chalk.red("Error:"), error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);
