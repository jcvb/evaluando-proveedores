import type { Prisma } from "@prisma/client";

export async function recomputeProviderMetrics(tx: Prisma.TransactionClient, providerId: string) {
  const reviews = await tx.review.findMany({
    where: { providerId, status: { not: "UNDER_MODERATION" } },
    select: { verdict: true, rating: true, status: true },
  });
  const totalReviews = reviews.length;
  const goodReviewsCount = reviews.filter((review) => review.verdict === "BUENO").length;
  const badReviewsCount = reviews.filter(
    (review) => review.verdict === "MALO" && review.status !== "RESOLVED_AFTER_ISSUE",
  ).length;
  const averageScore = totalReviews
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
    : 0;

  await tx.providerProfile.update({
    where: { id: providerId },
    data: { totalReviews, goodReviewsCount, badReviewsCount, averageScore },
  });
}
