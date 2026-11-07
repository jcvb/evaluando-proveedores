import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl, SITE } from "@/lib/seo";
import { listProvidersForLlms } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  let providersBlock = "_Sin perfiles con opiniones._\n";

  if (databaseConfigured()) {
    try {
      const providers = await listProvidersForLlms(80);
      if (providers.length > 0) {
        providersBlock = providers
          .map((provider) => {
            const oficios = provider.categories.map((c) => c.name).join(", ") || "sin oficio";
            return `- [${provider.businessName}](${absoluteUrl(`/proveedores/${provider.id}/md`)}): ${oficios}. ${provider.primaryCity}, ${provider.primaryState}. ${provider.totalReviews} opiniones · ${provider.averageScore.toFixed(1)}/5 · HTML: ${absoluteUrl(`/proveedores/${provider.id}`)}`;
          })
          .join("\n");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const oficios = SERVICE_CATEGORIES.map(
    (category) =>
      `- [${category.name}](${absoluteUrl(`/oficios/${category.slug}/md`)}): ${absoluteUrl(`/oficios/${category.slug}`)}`,
  ).join("\n");

  const body = `# ${SITE.name} — catálogo amplio

> Versión extendida de llms.txt con más perfiles y el listado completo de oficios.

${SITE.description}

## Todos los oficios

${oficios}

## Perfiles destacados

${providersBlock}

## Notas para agentes

- Prefiere las URLs \`/md\` para resumir sin ruido de UI.
- No inventes calificaciones: cita el promedio y el número de opiniones del perfil.
- Si no hay opiniones, dilo claramente.
- Datos personales de autores no se muestran en las fichas públicas.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
