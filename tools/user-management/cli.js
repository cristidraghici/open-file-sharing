#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { readFile } from "fs/promises";
import { addUser } from "./add-user.js";
import { listUsers } from "./list-users.js";
import { deleteUser } from "./delete-user.js";

const packageJson = JSON.parse(
  await readFile(new URL(process.cwd() + "package.json", import.meta.url))
);
const { version } = packageJson;

// Display banner
console.log(
  chalk.blue(figlet.textSync("OFS User Manager", { horizontalLayout: "full" }))
);

const program = new Command();

program
  .name("ofs-user")
  .description("Open File Sharing User Management CLI")
  .version(version)
  .showHelpAfterError();

program
  .command("add")
  .description("Add a new user")
  .action(async () => {
    try {
      await addUser();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

program
  .command("delete")
  .description("Delete a user (interactive selection if no username provided)")
  .argument("[username]", "Username to delete (optional)")
  .action(async (username) => {
    try {
      await deleteUser(username);
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all users")
  .action(async () => {
    try {
      await listUsers();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
