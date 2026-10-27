import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const cps = process.argv.slice(2);
for (const cp of cps.length ? cps : ["01000", "76000", "44100", "06600"]) {
  const n = await prisma.sepomexCatalog.count({ where: { codigoPostal: cp } });
  const row = await prisma.sepomexCatalog.findFirst({ where: { codigoPostal: cp } });
  console.log(cp, n, row?.asentamiento, row?.municipio, row?.estado);
}
console.log("total", await prisma.sepomexCatalog.count());
await prisma.$disconnect();
