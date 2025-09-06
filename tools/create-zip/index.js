import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { createZip } from "./create-zip.js";
import { listMedia } from "./list-media.js";

async function main() {
    console.log("\n" + chalk.blue.bold("Open File Sharing - Zip Creation Tool"));

    while (true) {
        const action = await select({
            message: "What would you like to do?",
            choices: [
                { name: "Create a zip file", value: "create" },
                { name: "List media files", value: "list" },
                { name: "Exit", value: "exit" },
            ],
        });

        try {
            switch (action) {
                case "create":
                    await createZipInteractive();
                    break;

                case "list":
                    await listMediaInteractive();
                    break;

                case "exit":
                    console.log(chalk.blue("\nGoodbye! 👋"));
                    return;
            }
        } catch (error) {
            console.error(chalk.red("\nError:"), error.message);
        }

        console.log(""); // Add a newline for better readability
    }
}

async function createZipInteractive() {
    const { input } = await import("@inquirer/prompts");
    const { confirm } = await import("@inquirer/prompts");
    const { select } = await import("@inquirer/prompts");

    const outputName = await input({
        message: "Enter output zip file name (without extension, date will be added automatically):",
        default: "media-files",
    });

    const type = await select({
        message: "Filter by file type (optional):",
        choices: [
            { name: "All files", value: null },
            { name: "Images only", value: "image" },
            { name: "Videos only", value: "video" },
            { name: "Documents only", value: "document" },
            { name: "Other files only", value: "other" },
        ],
    });

    const includeMetadata = await confirm({
        message: "Include metadata JSON files?",
        default: false,
    });

    const flat = await confirm({
        message: "Flatten directory structure?",
        default: false,
    });

    const noDate = await confirm({
        message: "Skip adding date to filename?",
        default: false,
    });

    const options = {
        type: type === "All files" ? null : type,
        includeMetadata,
        flat,
        noDate,
    };

    await createZip(outputName, options);
}

async function listMediaInteractive() {
    const { select } = await import("@inquirer/prompts");

    const type = await select({
        message: "Filter by file type (optional):",
        choices: [
            { name: "All files", value: null },
            { name: "Images only", value: "image" },
            { name: "Videos only", value: "video" },
            { name: "Documents only", value: "document" },
            { name: "Other files only", value: "other" },
        ],
    });

    const options = {
        type: type === "All files" ? null : type,
    };

    await listMedia(options);
}

main().catch(console.error);
