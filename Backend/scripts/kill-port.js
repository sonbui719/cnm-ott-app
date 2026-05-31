const { execSync } = require("child_process");

const port = String(process.argv[2] || process.env.PORT || 5000);
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const run = (command) => {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    return `${error.stdout || ""}${error.stderr || ""}`;
  }
};

const hasListener = () => {
  const output = run(`netstat -ano | findstr :${port}`);
  return output.split(/\r?\n/).some((line) => {
    const parts = line.trim().split(/\s+/);
    return parts.length >= 5 && (parts[1] || "").endsWith(`:${port}`) && parts[3] === "LISTENING";
  });
};

const killWindowsPort = () => {
  const output = run(`netstat -ano | findstr :${port}`);
  const pids = new Set();

  output.split(/\r?\n/).forEach((line) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) return;

    const localAddress = parts[1] || "";
    const state = parts[3] || "";
    const pid = parts[4] || "";

    if (!localAddress.endsWith(`:${port}`)) return;
    if (state !== "LISTENING") return;
    if (!/^\d+$/.test(pid) || pid === "0" || pid === String(process.pid)) return;

    pids.add(pid);
  });

  pids.forEach((pid) => {
    console.log(`Stopping process ${pid} on port ${port}...`);
    const result = run(`taskkill /PID ${pid} /T /F`);
    if (result.trim()) console.log(result.trim());
  });

  for (let i = 0; i < 10; i += 1) {
    if (!hasListener()) return;
    sleep(300);
  }
};

if (process.platform === "win32") {
  killWindowsPort();
} else {
  run(`lsof -ti:${port} | xargs kill -9`);
}
