
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("dotenv").config({ path: ".env.local", quiet: true });

const readline = createInterface({ input, output });

function promptHidden(question) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const wasRaw = Boolean(input.isRaw);

    output.write(question);

    input.setRawMode?.(true);
    input.resume();

    function cleanup() {
      input.removeListener("data", onData);
      input.setRawMode?.(wasRaw);
      output.write("\n");
    }

    function onData(chunk) {
      const bytes = Buffer.from(chunk);

      for (const byte of bytes) {
        if (byte === 3) {
          cleanup();
          reject(new Error("Cancelled"));
          return;
        }

        if (byte === 13 || byte === 10) {
          cleanup();
          resolve(Buffer.concat(chunks).toString("utf8"));
          return;
        }

        if (byte === 127 || byte === 8) {
          chunks.pop();
          continue;
        }

        chunks.push(Buffer.from([byte]));
      }
    }

    input.on("data", onData);
  });
}

let connection;

try {
  const username = (await readline.question("Admin username: ")).trim();

  if (!/^[A-Za-z0-9_-]{3,50}$/.test(username)) {
    throw new Error(
      "Username must be 3–50 letters, numbers, underscores or hyphens."
    );
  }

  readline.pause();

  const password = await promptHidden("Admin password (hidden): ");
  const confirmation = await promptHidden("Confirm password (hidden): ");

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  if (password.length < 12) {
    throw new Error("Use a password of at least 12 characters.");
  }

  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [existing] = await connection.execute(
    "SELECT User_ID FROM App_User WHERE Username = ?",
    [username]
  );

  if (existing.length > 0) {
    throw new Error("That username already exists.");
  }

  const hash = await bcrypt.hash(password, 12);

  const [result] = await connection.execute(
    `INSERT INTO App_User
       (Username, Password_Hash, Role, Is_Active)
     VALUES (?, ?, 'Admin', 1)`,
    [username, hash]
  );

  console.log(`Admin account created. User ID: ${result.insertId}`);
} catch (error) {
  console.error("Account creation failed:", error.message);
  process.exitCode = 1;
} finally {
  await connection?.end();
  readline.close();
}
