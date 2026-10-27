import { readFileSync } from "fs";

export async function applyTrgmIndexes(prisma) {
  const sql = readFileSync(new URL("./sql/trgm-indexes.sql", import.meta.url), "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.replace(/--.*$/gm, "").trim())
    .filter(Boolean);
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}
