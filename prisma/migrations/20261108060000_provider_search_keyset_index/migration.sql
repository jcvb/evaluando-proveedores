-- Índice alineado al ORDER BY de searchProviders (keyset pagination).
CREATE INDEX IF NOT EXISTS "ProviderProfile_badReviewsCount_totalReviews_id_idx"
ON "ProviderProfile"("badReviewsCount", "totalReviews", "id");
