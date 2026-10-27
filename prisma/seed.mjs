import { PrismaClient } from "@prisma/client";
import { applyTrgmIndexes } from "./apply-indexes.mjs";
import { sampleSepomex } from "./sample-sepomex.mjs";

const SERVICE_CATEGORIES = [
  { name: "Cocinas integrales", slug: "cocinas-integrales", icon: "cooking" },
  { name: "Clósets", slug: "closets", icon: "cabinet" },
  { name: "Carpintería", slug: "carpinteria", icon: "hammer" },
  { name: "Herrería", slug: "herreria", icon: "anvil" },
  { name: "Plomería", slug: "plomeria", icon: "droplet" },
  { name: "Electricidad", slug: "electricidad", icon: "zap" },
  { name: "Albañilería", slug: "albanileria", icon: "brick" },
  { name: "Aluminio y cancelería", slug: "aluminio", icon: "panels" },
  { name: "Pintura", slug: "pintura", icon: "paint" },
  { name: "Impermeabilización", slug: "impermeabilizacion", icon: "umbrella" },
  { name: "Yeso y tablaroca", slug: "yeso-tablaroca", icon: "wall" },
  { name: "Pisos y azulejos", slug: "pisos-azulejos", icon: "grid" },
  { name: "Vidriería", slug: "vidrieria", icon: "glass" },
  { name: "Cancelería de PVC", slug: "canceleria-pvc", icon: "window" },
  { name: "Toldos y lonas", slug: "toldos-lonas", icon: "awning" },
  { name: "Persianas y cortinas", slug: "persianas-cortinas", icon: "blinds" },
  { name: "Aire acondicionado", slug: "aire-acondicionado", icon: "snowflake" },
  { name: "Calentadores y boiler", slug: "calentadores-boiler", icon: "flame" },
  { name: "Gas", slug: "gas", icon: "gas" },
  { name: "Tinacos y cisternas", slug: "tinacos-cisternas", icon: "tank" },
  { name: "Fumigación", slug: "fumigacion", icon: "bug" },
  { name: "Jardinería y paisajismo", slug: "jardineria", icon: "leaf" },
  { name: "Cerámica y mosaicos", slug: "ceramica-mosaicos", icon: "tiles" },
  { name: "Mármol y granito", slug: "marmol-granito", icon: "stone" },
  { name: "Soldadura", slug: "soldadura", icon: "weld" },
  { name: "Techumbres y lámina", slug: "techumbres-lamina", icon: "roof" },
  { name: "Cancelería de madera", slug: "canceleria-madera", icon: "door" },
  { name: "Puertas y portones", slug: "puertas-portones", icon: "gate" },
  { name: "Cerrajería", slug: "cerrajeria", icon: "key" },
  { name: "Alfombras y pisos vinílicos", slug: "alfombras-vinilicos", icon: "floor" },
  { name: "Tapicería", slug: "tapiceria", icon: "sofa" },
  { name: "Muebles a la medida", slug: "muebles-medida", icon: "furniture" },
  { name: "Baños y remodelación", slug: "banos-remodelacion", icon: "bath" },
  { name: "Drywall y plafones", slug: "drywall-plafones", icon: "ceiling" },
  { name: "Iluminación", slug: "iluminacion", icon: "bulb" },
  { name: "Domótica y automatización", slug: "domotica", icon: "home" },
  { name: "Paneles solares", slug: "paneles-solares", icon: "sun" },
  { name: "Cisternas y pozos", slug: "cisternas-pozos", icon: "well" },
  { name: "Riego por aspersión", slug: "riego-aspersion", icon: "sprinkler" },
  { name: "Pérgolas y terrazas", slug: "pergolas-terrazas", icon: "pergola" },
  { name: "Barandales y pasamanos", slug: "barandales", icon: "rail" },
  { name: "Escaleras", slug: "escaleras", icon: "stairs" },
  { name: "Chimeneas y asadores", slug: "chimeneas-asadores", icon: "fireplace" },
  { name: "Piscinas y spa", slug: "piscinas-spa", icon: "pool" },
  { name: "Limpieza profunda", slug: "limpieza-profunda", icon: "clean" },
  { name: "Mudanzas y acarreos", slug: "mudanzas", icon: "truck" },
  { name: "Arquitectura e interiorismo", slug: "arquitectura-interiorismo", icon: "blueprint" },
  { name: "Ingeniería estructural", slug: "ingenieria-estructural", icon: "structure" },
];

const prisma = new PrismaClient();

async function main() {
  for (const category of SERVICE_CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, icon: category.icon },
      create: category,
    });
  }

  const postalRows = await prisma.sepomexCatalog.count();
  if (postalRows === 0) {
    await prisma.sepomexCatalog.createMany({ data: sampleSepomex });
    console.log(`Catálogo postal de muestra: ${sampleSepomex.length} asentamientos.`);
    console.log("Para el padrón completo: npm run db:import-sepomex -- ruta/CPdescarga.txt --replace");
  }

  await applyTrgmIndexes(prisma);
  console.log("Oficios listos e índices de similitud aplicados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
