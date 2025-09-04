import { input, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import { execSync } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const servicePath = join(process.cwd(), "apps/service");

export async function addUser() {
  console.log("\n" + chalk.blue.bold("Add a New User"));
  console.log(chalk.gray("Please provide the following information:"));

  try {
    const username = await input({
      message: "Username:",
      validate: (value) => {
        if (!value.trim()) return "Username is required";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Username can only contain letters, numbers, and underscores";
        }
        return true;
      },
    });

    const userPassword = await password({
      message: "Password:",
      mask: "*",
      validate: (value) => {
        if (value.length < 8)
          return "Password must be at least 8 characters long";
        return true;
      },
    });

    const confirmPassword = await password({
      message: "Confirm Password:",
      mask: "*",
    });

    if (userPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const role = await select({
      message: "Select user role:",
      choices: [
        { name: "User", value: "user" },
        { name: "Admin", value: "admin" },
      ],
    });

    // Execute the PHP command to add the user
    console.log("\n" + chalk.blue("Creating user..."));
    const command = `composer run user:add -- ${username} ${userPassword} ${role}`;
    const options = {
      cwd: servicePath,
      stdio: "pipe",
      shell: true,
    };
    const output = execSync(command, options).toString();

    if (output.includes("successfully created")) {
      console.log(chalk.green("✓ User created successfully!"));
      console.log(chalk.blue("User Details:"));
      console.log(chalk.blue("  Username:"), username);
      console.log(chalk.blue("  Role:"), role);
    } else {
      throw new Error(output || "Failed to create user");
    }
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.error(
        chalk.red("✗ Error:"),
        "A user with this username already exists."
      );
    } else {
      console.error(chalk.red("✗ Error:"), error.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  addUser();
}
