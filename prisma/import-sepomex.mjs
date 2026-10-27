/**
 * Importa el Catálogo Nacional de Códigos Postales (SEPOMEX / Correos de México).
 *
 * Descarga el archivo oficial "CPdescarga.txt" (delimitado por pipes, a menudo Latin-1)
 * desde el portal de Correos de México:
 * https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
 *
 * También acepta un CSV con encabezados codigo_postal, asentamiento, tipo_asentamiento,
 * municipio, estado y ciudad.
 *
 * El archivo no se versiona. Uso:
 *   npm run db:import-sepomex -- ./CPdescarga.txt --replace
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { applyTrgmIndexes } from "./apply-indexes.mjs";

const HEADER_MAP = {
  d_codigo: "codigoPostal",
  codigo_postal: "codigoPostal",
  codigopostal: "codigoPostal",
  cp: "codigoPostal",
  d_asenta: "asentamiento",
  asentamiento: "asentamiento",
  colonia: "asentamiento",
  d_tipo_asenta: "tipoAsentamiento",
  tipo_asentamiento: "tipoAsentamiento",
  tipoasentamiento: "tipoAsentamiento",
  d_mnpio: "municipio",
  municipio: "municipio",
  d_estado: "estado",
  estado: "estado",
  d_ciudad: "ciudad",
  ciudad: "ciudad",
};

function decode(file) {
  const buffer = readFileSync(file);
  const utf8 = buffer.toString("utf8");
  if (utf8.includes("\uFFFD")) return new TextDecoder("latin1").decode(buffer);
  return utf8;
}

function parseLine(line, delimiter) {
  return line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const replace = args.includes("--replace");
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file) {
    console.error("Indica la ruta del archivo SEPOMEX. Ver el comentario al inicio de este script.");
    process.exitCode = 1;
    return;
  }

  const text = decode(file).replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  // El TXT oficial de Correos trae una línea de aviso antes del encabezado.
  const headerIndex = lines.findIndex((line) => /d_codigo|codigo_postal|codigopostal/i.test(line));
  if (headerIndex < 0) {
    console.error("No encontré la fila de encabezados (d_codigo / codigo_postal).");
    process.exitCode = 1;
    return;
  }
  const delimiter = lines[headerIndex]?.includes("|") ? "|" : ",";
  const headers = parseLine(lines[headerIndex] ?? "", delimiter).map((header) => header.toLowerCase());
  const indexes = {
    codigoPostal: headers.findIndex((header) => HEADER_MAP[header] === "codigoPostal"),
    asentamiento: headers.findIndex((header) => HEADER_MAP[header] === "asentamiento"),
    tipoAsentamiento: headers.findIndex((header) => HEADER_MAP[header] === "tipoAsentamiento"),
    municipio: headers.findIndex((header) => HEADER_MAP[header] === "municipio"),
    estado: headers.findIndex((header) => HEADER_MAP[header] === "estado"),
    ciudad: headers.findIndex((header) => HEADER_MAP[header] === "ciudad"),
  };
  if (Object.values(indexes).some((index) => index < 0)) {
    console.error("No reconocí los encabezados. Se esperaba d_codigo/d_asenta o codigo_postal/asentamiento.");
    console.error("Encabezados leídos:", headers.join(", "));
    process.exitCode = 1;
    return;
  }

  const rows = [];
  for (const line of lines.slice(headerIndex + 1)) {
    const cells = parseLine(line, delimiter);
    const codigoPostal = (cells[indexes.codigoPostal] ?? "").padStart(5, "0").slice(-5);
    if (!/^\d{5}$/.test(codigoPostal)) continue;
    const asentamiento = cells[indexes.asentamiento] ?? "";
    const municipio = cells[indexes.municipio] ?? "";
    const estado = cells[indexes.estado] ?? "";
    if (!asentamiento || !municipio || !estado) continue;
    rows.push({
      codigoPostal,
      asentamiento,
      tipoAsentamiento: cells[indexes.tipoAsentamiento] || "Colonia",
      municipio,
      estado,
      ciudad: cells[indexes.ciudad] || null,
    });
  }

  const prisma = new PrismaClient();
  try {
    if (!replace && (await prisma.sepomexCatalog.count()) > 1000) {
      console.error("El catálogo ya tiene datos. Vuelve a correr con --replace para sustituirlo.");
      process.exitCode = 1;
      return;
    }
    if (replace) await prisma.sepomexCatalog.deleteMany();
    const size = 1000;
    for (let offset = 0; offset < rows.length; offset += size) {
      await prisma.sepomexCatalog.createMany({ data: rows.slice(offset, offset + size) });
      console.log(`${Math.min(offset + size, rows.length)} / ${rows.length}`);
    }
    await applyTrgmIndexes(prisma);
    console.log(`Importados ${rows.length} asentamientos.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
