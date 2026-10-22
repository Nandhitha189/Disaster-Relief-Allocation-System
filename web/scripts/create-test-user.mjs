

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

dotenv.config({
  path: ".env.local",
  quiet: true,
});

// Get role from terminal argument.
const role = process.argv[2];

// This script must never create Admin accounts.
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

function promptHidden(question) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      reject(new Error("Run this script in a normal interactive Terminal."));
      return;
    }

    let password = "";
    const previousRawMode = Boolean(stdin.isRaw);

    // Prevent readline from interfering with hidden password input.
    readline.pause();
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();

    function cleanup() {
      stdin.off("data", handleData);
      stdin.setRawMode(previousRawMode);
      stdout.write("\n");
    }

    function handleData(chunk) {
      const characters = chunk.toString("utf8");

      for (const character of characters) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Operation cancelled."));
          return;
        }

        if (character === "\r" || character === "\n") {
          cleanup();
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

    stdin.on("data", handleData);
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
      "Username must be 3-50 characters and contain only letters, numbers, underscores or hyphens."
    );
  }

  const password = await promptHidden(
    "Password (hidden): "
  );

  const confirmPassword = await promptHidden(
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

  // Check whether the username is already registered.
  const [existingUsers] = await connection.execute(
    `SELECT User_ID
     FROM App_User
     WHERE Username = ?`,
    [username]
  );

  if (existingUsers.length > 0) {
    throw new Error(
      "Username already exists. Choose a different username."
    );
  }

  // Hash password before inserting it into MySQL.
  const passwordHash = await bcrypt.hash(password, 12);

  // Insert account with the correct requested role.
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
