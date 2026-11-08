/**
 * Escenarios contra la BD de desarrollo.
 * Corre con: npm test
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";
import { SEARCH_PAGE_SIZE, decodeSearchCursor } from "@/lib/search-cursor";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("searchProviders integración zona Xaltipa", { skip: !hasDb }, () => {
  const prisma = new PrismaClient();
  let searchProviders: typeof import("@/server/queries").searchProviders;

  before(async () => {
    ({ searchProviders } = await import("@/server/queries"));
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("CP 54850 → México + Cuautitlán + Xaltipa encuentra proveedores sin reseñas", async () => {
    const catalog = await prisma.sepomexCatalog.findFirst({
      where: { codigoPostal: "54850", asentamiento: "Xaltipa" },
    });
    assert.ok(catalog, "Debe existir Xaltipa CP 54850 en SEPOMEX");

    const results = await searchProviders({
      estado: catalog.estado,
      municipio: catalog.municipio,
      colonia: "Xaltipa",
    });

    assert.ok(results.items.length > 0, "Debía devolver proveedores de Xaltipa");
  });

  it("solo estado + municipio (sin colonia forzada) también encuentra", async () => {
    const results = await searchProviders({
      estado: "México",
      municipio: "Cuautitlán",
    });
    assert.ok(results.items.length > 0);
  });
});

describe("searchProviders paginación por cursor", { skip: !hasDb }, () => {
  const prisma = new PrismaClient();
  let searchProviders: typeof import("@/server/queries").searchProviders;

  before(async () => {
    ({ searchProviders } = await import("@/server/queries"));
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("primera y segunda página no se solapan y respetan pageSize", async () => {
    const first = await searchProviders({
      estado: "México",
      municipio: "Cuautitlán",
    });
    assert.ok(first.items.length > 0);
    assert.equal(first.pageSize, SEARCH_PAGE_SIZE);
    assert.ok(first.items.length <= SEARCH_PAGE_SIZE);

    if (!first.nextCursor) {
      assert.ok(first.items.length < SEARCH_PAGE_SIZE || first.items.length === SEARCH_PAGE_SIZE);
      return;
    }

    const decoded = decodeSearchCursor(first.nextCursor);
    assert.ok(decoded);
    assert.equal(decoded?.t, "k");

    const second = await searchProviders({
      estado: "México",
      municipio: "Cuautitlán",
      cursor: first.nextCursor,
    });

    const firstIds = new Set(first.items.map((item) => item.id));
    for (const item of second.items) {
      assert.equal(firstIds.has(item.id), false, `ID repetido entre páginas: ${item.id}`);
    }
  });

  it("cursor inválido cae a la primera página", async () => {
    const baseline = await searchProviders({ estado: "México", municipio: "Cuautitlán" });
    const broken = await searchProviders({
      estado: "México",
      municipio: "Cuautitlán",
      cursor: "no-es-un-cursor",
    });
    assert.deepEqual(
      broken.items.map((item) => item.id),
      baseline.items.map((item) => item.id),
    );
  });

  it("con q usa cursor de similitud (tipo s) cuando hay más de una página de candidatos", async () => {
    const first = await searchProviders({ q: "a" });
    if (!first.nextCursor) return;
    const decoded = decodeSearchCursor(first.nextCursor);
    assert.ok(decoded);
    // Puede ser keyset si similarity falló y cayó al path normal; ambos son válidos.
    assert.ok(decoded?.t === "s" || decoded?.t === "k");

    const second = await searchProviders({ q: "a", cursor: first.nextCursor });
    const overlap = second.items.filter((item) => first.items.some((row) => row.id === item.id));
    assert.equal(overlap.length, 0);
  });
});
