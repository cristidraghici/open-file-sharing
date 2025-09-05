import chalk from "chalk";
import { execSync } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const servicePath = join(process.cwd(), "apps/service");

export async function listUsers() {
  console.log("\n" + chalk.blue.bold("List Users"));
  try {
    console.log(chalk.gray("Fetching users from service..."));
    const command = `composer run user:list`;
    const options = {
      cwd: servicePath,
      stdio: "pipe",
      shell: true,
    };
    const output = execSync(command, options).toString();

    // Print service output as-is for table formatting
    if (output && output.trim().length > 0) {
      // Highlight title line if present
      const lines = output.split(/\r?\n/);
      if (lines.length > 0 && /Registered Users/i.test(lines[0])) {
        console.log("\n" + chalk.yellow(lines[0]));
        console.log(lines.slice(1).join("\n"));
      } else {
        console.log("\n" + output.trim());
      }
    } else {
      console.log(chalk.yellow("No users found."));
    }
  } catch (error) {
    const msg = error?.stdout?.toString() || error?.message || "Unknown error";
    console.error(chalk.red("✗ Error listing users:"), msg.trim());
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  listUsers();
}
