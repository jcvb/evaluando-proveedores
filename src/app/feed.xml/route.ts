import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl, SITE, truncateMeta, verdictLabel } from "@/lib/seo";
import { listRecentReviewsForFeed } from "@/server/queries";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let itemsXml = "";

  if (databaseConfigured()) {
    try {
      const reviews = await listRecentReviewsForFeed(40);
      itemsXml = reviews
        .map((review) => {
          const link = absoluteUrl(`/proveedores/${review.provider.id}`);
          const title = `${review.provider.businessName}: ${review.title}`;
          const description = truncateMeta(
            `${review.category.name} en ${review.cityOrMunicipality}, ${review.state}. Veredicto: ${verdictLabel(review.verdict)} (${review.rating}/5). ${review.description}`,
            280,
          );
          return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(review.id)}</guid>
      <pubDate>${review.createdAt.toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(review.category.name)}</category>
    </item>`;
        })
        .join("\n");
    } catch (error) {
      console.error(error);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>es-mx</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
