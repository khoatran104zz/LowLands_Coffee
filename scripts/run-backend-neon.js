const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const backendDir = path.join(rootDir, "code", "backend");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`No .env file found at ${filePath}. Using existing environment variables.`);
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function validateEnvironment() {
  const requiredVariables = ["DB_URL", "DB_USERNAME", "DB_PASSWORD", "JWT_SECRET"];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
  }

  const dbUrl = process.env.DB_URL;

  if (!dbUrl.startsWith("jdbc:postgresql://")) {
    throw new Error("DB_URL must use JDBC PostgreSQL format: jdbc:postgresql://<host>/<database>?sslmode=require");
  }

  if (/localhost|127\.0\.0\.1/i.test(dbUrl)) {
    throw new Error("DB_URL points to local PostgreSQL. Development scripts must use Neon PostgreSQL.");
  }

  if (!/sslmode=require/i.test(dbUrl)) {
    throw new Error("DB_URL must include sslmode=require for Neon PostgreSQL.");
  }
}

function assertPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use. Stop the running backend or set SERVER_PORT to another value.`));
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(resolve);
    });

    server.listen(port, "0.0.0.0");
  });
}

loadDotEnv(envPath);
validateEnvironment();

const serverPort = Number.parseInt(process.env.SERVER_PORT || "8080", 10);

if (!Number.isInteger(serverPort) || serverPort < 1 || serverPort > 65535) {
  throw new Error("SERVER_PORT must be a valid TCP port between 1 and 65535.");
}

assertPortAvailable(serverPort)
  .then(() => {
    console.log("Starting backend with Neon PostgreSQL environment.");
    console.log("Database credentials and URL are loaded but not printed.");

    const mvnCommand = process.platform === "win32" ? "mvn.cmd" : "mvn";
    const child = spawn(mvnCommand, ["spring-boot:run"], {
      cwd: backendDir,
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      process.exit(code ?? 0);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
