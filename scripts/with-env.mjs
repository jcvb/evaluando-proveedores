import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2];
const separator = process.argv.indexOf("--");

if ((target !== "development" && target !== "production") || separator === -1) {
  console.error("Uso: node scripts/with-env.mjs development|production -- comando");
  process.exit(1);
}

const file = resolve(process.cwd(), target === "development" ? ".env.development" : ".env.production");
const env = { ...process.env };

for (const line of readFileSync(file, "utf8").split("\n")) {
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

if (target === "production" && env.APP_ENV !== "production") {
  console.error("El archivo .env.production debe incluir APP_ENV=production.");
  process.exit(1);
}

const command = process.argv.slice(separator + 1);
if (command.length === 0) {
  console.error("Falta el comando después de --");
  process.exit(1);
}

const child = spawn(command[0], command.slice(1), { stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 1));
