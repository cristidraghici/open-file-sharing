import { select } from "@inquirer/prompts";
import chalk from "chalk";
import { addUser } from "./add-user.js";
import { listUsers } from "./list-users.js";

async function main() {
  console.log("\n" + chalk.blue.bold("Open File Sharing - User Management"));

  while (true) {
    const action = await select({
      message: "What would you like to do?",
      choices: [
        { name: "Add a new user", value: "add" },
        { name: "List all users", value: "list" },
        { name: "Exit", value: "exit" },
      ],
    });

    try {
      switch (action) {
        case "add":
          await addUser();
          break;

        case "list":
          await listUsers();
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

main().catch(console.error);
