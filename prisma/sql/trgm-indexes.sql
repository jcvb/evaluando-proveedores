-- Índices de similitud. Prisma no declara el opclass gin_trgm_ops.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS provider_business_name_trgm
  ON "ProviderProfile" USING GIN ("businessName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS sepomex_asentamiento_trgm
  ON "SepomexCatalog" USING GIN (asentamiento gin_trgm_ops);

CREATE INDEX IF NOT EXISTS review_fraccionamiento_trgm
  ON "Review" USING GIN (fraccionamiento gin_trgm_ops);
