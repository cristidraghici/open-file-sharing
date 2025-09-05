import chalk from "chalk";
import { execSync } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { select } from "@inquirer/prompts";
import { getUsers } from "./get-users.js";

const servicePath = join(process.cwd(), "apps/service");

export async function deleteUser(usernameArg) {
  console.log("\n" + chalk.blue.bold("Delete User"));
  try {
    let username = usernameArg;

    if (!username) {
      const users = await getUsers();
      if (!users.length) {
        console.log(chalk.yellow("No users to delete."));
        return;
      }

      const choice = await select({
        message: "Select a user to delete",
        choices: users.map((u) => ({ name: `${u.username} (${u.role})`, value: u.username })),
      });
      username = choice;
    }

    const command = `composer run user:delete -- ${username}`;
    const options = {
      cwd: servicePath,
      stdio: "inherit",
      shell: true,
    };
    execSync(command, options);
  } catch (error) {
    const msg = error?.stdout?.toString() || error?.message || "Unknown error";
    console.error(chalk.red("✗ Error deleting user:"), msg.trim());
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const maybeUsername = process.argv.length > 2 ? process.argv[2] : undefined;
  deleteUser(maybeUsername);
}
