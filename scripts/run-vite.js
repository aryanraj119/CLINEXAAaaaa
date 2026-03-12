#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const wrapperPath = path.join(process.cwd(), "scripts", "esbuild-wrapper.cmd");

if (process.platform === "win32" && fs.existsSync(wrapperPath) && !process.env.ESBUILD_BINARY_PATH) {
  process.env.ESBUILD_BINARY_PATH = wrapperPath;
  console.log("ESBUILD_BINARY_PATH set to wrapper", wrapperPath);
}

const vitePath = path.join(process.cwd(), "node_modules", "vite", "bin", "vite.js");
const args = process.argv.slice(2);
const child = spawn(process.execPath, [vitePath, ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

child.on("error", (error) => {
  console.error("Failed to start Vite:", error);
  process.exit(1);
});
