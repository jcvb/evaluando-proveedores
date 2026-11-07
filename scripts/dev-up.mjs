#!/usr/bin/env node
/**
 * Arranca el entorno local de un jalón:
 * 1) Postgres de desarrollo en Docker (el de producción no se toca)
 * 2) Prisma generate + migrate
 * 3) Seed si no hay oficios
 * 4) Next.js en el puerto indicado (default 3000)
 *
 * Uso:
 *   npm run up
 *   npm run up -- --port 3001
 *   npm run up -- --skip-seed
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const skipSeed = args.includes("--skip-seed");
const portFlag = args.indexOf("--port");
const port = portFlag !== -1 ? args[portFlag + 1] : "3000";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = {
  ...process.env,
  ...loadEnvFile(resolve(root, ".env")),
  ...loadEnvFile(resolve(root, ".env.development")),
  ...loadEnvFile(resolve(root, ".env.local")),
};

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`Falló: ${command} ${commandArgs.join(" ")}`);
  }
}

function log(message) {
  console.log(`\n▸ ${message}`);
}

async function main() {
  if (!existsSync(resolve(root, ".env.development"))) {
    throw new Error("Falta .env.development. Copia .env.example y ajusta las URLs.");
  }

  log("Levantando Postgres de desarrollo (proveedores-pg-dev, puerto 54329)");
  run("docker", ["compose", "up", "-d", "--wait", "postgres-dev"]);

  log("Generando cliente Prisma");
  run("npx", ["prisma", "generate"]);

  log("Aplicando migraciones (dev)");
  run("npx", ["prisma", "migrate", "deploy"]);

  if (!skipSeed) {
    // El seed es seguro de repetir: usa upserts / restricciones únicas en oficios.
    log("Ejecutando seed");
    run("node", ["prisma/seed.mjs"]);
  }

  log(`Arrancando Next.js en http://localhost:${port}`);
  const child = spawn("npx", ["next", "dev", "--turbopack", "--port", String(port)], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  const stop = () => {
    if (!child.killed) child.kill("SIGTERM");
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  child.on("exit", (code) => process.exit(code ?? 1));
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`);
  process.exit(1);
});
