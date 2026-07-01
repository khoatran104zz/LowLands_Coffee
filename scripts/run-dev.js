const { spawn } = require("child_process");
const readline = require("readline");

const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error("Unable to locate npm CLI. Please run this script through npm.");
  process.exit(1);
}

const processes = [];
let shuttingDown = false;

function prefixStream(stream, label, output) {
  const rl = readline.createInterface({ input: stream });

  rl.on("line", (line) => {
    output.write(`[${label}] ${line}\n`);
  });
}

function stopAll(signal = "SIGTERM") {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

function run(label, args) {
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  processes.push(child);
  prefixStream(child.stdout, label, process.stdout);
  prefixStream(child.stderr, label, process.stderr);

  child.on("error", (error) => {
    console.error(`[${label}] Failed to start: ${error.message}`);
    stopAll();
    process.exitCode = 1;
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal) {
      console.error(`[${label}] exited via ${signal}`);
    } else {
      console.error(`[${label}] exited with code ${code}`);
    }

    process.exitCode = code ?? 1;
    stopAll();
  });
}

process.on("SIGINT", () => {
  stopAll("SIGINT");
});

process.on("SIGTERM", () => {
  stopAll("SIGTERM");
});

run("backend", ["scripts/run-backend-neon.js"]);
run("frontend", [npmCli, "--prefix", "code/frontend", "run", "dev"]);
