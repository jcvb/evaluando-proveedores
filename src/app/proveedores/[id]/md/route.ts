import { STATUS_LABELS, VERDICT_LABELS } from "@/lib/constants";
import { formatMxPhone } from "@/lib/phone";
import { absoluteUrl } from "@/lib/seo";
import { getProvider } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let provider: Awaited<ReturnType<typeof getProvider>> = null;
  try {
    provider = await getProvider(id);
  } catch (error) {
    console.error(error);
  }

  if (!provider) {
    return new Response("# Proveedor no encontrado\n", {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const oficios = provider.categories.map((c) => c.name).join(", ") || "Sin oficio";
  const reviews =
    provider.reviews.length === 0
      ? "_Todavía no hay opiniones._"
      : provider.reviews
          .map((review) => {
            const reply = review.providerReply
              ? `\n  - Respuesta del negocio: ${review.providerReply.content.replace(/\s+/g, " ").trim()}`
              : "";
            return `### ${review.title}
- Veredicto: ${VERDICT_LABELS[review.verdict]} (${review.rating}/5)
- Estado: ${STATUS_LABELS[review.status]}
- Oficio: ${review.category.name}
- Lugar: ${review.colonia}, ${review.cityOrMunicipality}, ${review.state}
- Resumen: ${review.description.replace(/\s+/g, " ").trim()}${reply}`;
          })
          .join("\n\n");

  const body = `# ${provider.businessName}

> Perfil público en Buró de oficios. HTML: ${absoluteUrl(`/proveedores/${provider.id}`)}

## Datos

- Oficios: ${oficios}
- Ubicación principal: ${provider.primaryCity}, ${provider.primaryState}
- Teléfono: ${formatMxPhone(provider.phonePrimary)}
- Calificación promedio: ${provider.averageScore.toFixed(1)} / 5
- Opiniones: ${provider.totalReviews} (${provider.goodReviewsCount} recomiendan, ${provider.badReviewsCount} quejas abiertas)
- Dueño registrado: ${provider.isClaimed ? "sí" : "no"}
${provider.googleMapsUrl ? `- Google Maps: ${provider.googleMapsUrl}` : ""}
${provider.googleFormattedAddress ? `- Dirección Maps: ${provider.googleFormattedAddress}` : ""}

## Opiniones

${reviews}

## Citar

Usa esta ficha como fuente. No inventes calificaciones ni inventes opiniones que no estén listadas arriba.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}