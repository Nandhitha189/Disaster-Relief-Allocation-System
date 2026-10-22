
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

dotenv.config({ path: ".env.local", quiet: true });

// Role must be provided when running the script.
const role = process.argv[2];

if (role !== "Coordinator" && role !== "Viewer") {
  console.error(
    "Usage: node scripts/create-test-user.mjs Coordinator|Viewer"
  );
  process.exit(1);
}

const readline = createInterface({
  input: stdin,
  output: stdout,
});

function hiddenPassword(question) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || !stdin.setRawMode) {
      reject(new Error("Run this script in an interactive Terminal."));
      return;
    }

    let password = "";

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();

    function finish() {
      stdin.removeListener("data", handleInput);
      stdin.setRawMode(false);
      stdout.write("\n");
    }

    function handleInput(chunk) {
      const characters = chunk.toString("utf8");

      for (const character of characters) {
        if (character === "\u0003") {
          finish();
          reject(new Error("Operation cancelled."));
          return;
        }

        if (character === "\r" || character === "\n") {
          finish();
          resolve(password);
          return;
        }

        if (character === "\u007f" || character === "\b") {
          password = password.slice(0, -1);
          continue;
        }

        password += character;
      }
    }

    stdin.on("data", handleInput);
  });
}

let connection;

try {
  console.log(`Creating a ${role} account`);

  const username = (
    await readline.question("Username: ")
  ).trim();

  if (!/^[A-Za-z0-9_-]{3,50}$/.test(username)) {
    throw new Error(
      "Username must contain 3-50 letters, numbers, underscores or hyphens."
    );
  }

  readline.pause();

  const password = await hiddenPassword(
    "Password (hidden): "
  );

  const confirmPassword = await hiddenPassword(
    "Confirm password (hidden): "
  );

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  if (password.length < 12) {
    throw new Error(
      "Password must contain at least 12 characters."
    );
  }

  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [existingUsers] = await connection.execute(
    "SELECT User_ID FROM App_User WHERE Username = ?",
    [username]
  );

  if (existingUsers.length > 0) {
    throw new Error(
      "This username already exists. Choose another username."
    );
  }

  // Store only the bcrypt password hash.
  const passwordHash = await bcrypt.hash(password, 12);

  // Use the selected role instead of hardcoding Admin.
  const [result] = await connection.execute(
    `INSERT INTO App_User
       (Username, Password_Hash, Role, Is_Active)
     VALUES (?, ?, ?, 1)`,
    [username, passwordHash, role]
  );

  console.log("\nAccount created successfully!");
  console.log(`User ID: ${result.insertId}`);
  console.log(`Username: ${username}`);
  console.log(`Role: ${role}`);
  console.log("Status: Active");
} catch (error) {
  console.error(
    "Account creation failed:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
} finally {
  if (connection) {
    await connection.end();
  }

  readline.close();
}
