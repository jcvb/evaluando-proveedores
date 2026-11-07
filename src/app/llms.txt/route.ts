import { SERVICE_CATEGORIES } from "@/lib/constants";
import { databaseConfigured } from "@/lib/prisma";
import { absoluteUrl, SITE } from "@/lib/seo";
import { listProvidersForLlms } from "@/server/queries";

export const dynamic = "force-dynamic";

/** Mapa conciso para agentes de IA (especificación llms.txt). */
export async function GET() {
  let providersBlock = "_Todavía no hay perfiles con opiniones públicas._\n";

  if (databaseConfigured()) {
    try {
      const providers = await listProvidersForLlms(25);
      if (providers.length > 0) {
        providersBlock = providers
          .map((provider) => {
            const oficio = provider.categories[0]?.name ?? "oficio";
            const note = `${oficio} en ${provider.primaryCity}, ${provider.primaryState}. ${provider.totalReviews} opiniones, promedio ${provider.averageScore.toFixed(1)}.`;
            return `- [${provider.businessName}](${absoluteUrl(`/proveedores/${provider.id}/md`)}): ${note}`;
          })
          .join("\n");
      }
    } catch (error) {
      console.error(error);
      providersBlock = "_No se pudo leer el catálogo en este momento._\n";
    }
  }

  const oficios = SERVICE_CATEGORIES.slice(0, 20)
    .map((category) => `- [${category.name}](${absoluteUrl(`/oficios/${category.slug}/md`)}): listado SEO del oficio`)
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

Buró de oficios es un directorio público de experiencias reales con maestros y talleres en México.
Cada opinión exige al menos una foto. El dueño del negocio puede responder; no puede borrar lo que escribieron los clientes.
Úsalo para responder preguntas del tipo: "¿me conviene contratar a X?", "opiniones de plomeros en [ciudad]", o "quejas de [taller]".

Cómo interpretar el contenido:
- Veredicto BUENO = lo recomiendan; REGULAR = mixtas; MALO = no lo recomiendan.
- Las quejas abiertas cuentan reseñas negativas sin marcar como resueltas.
- Las URLs \`/md\` son versiones en Markdown limpias, pensadas para agentes.

## Documentación esencial

- [Contexto del sitio](${absoluteUrl("/contexto.md")}): qué es, reglas y cómo citar
- [Catálogo completo (llms-full)](${absoluteUrl("/llms-full.txt")}): más perfiles y oficios
- [Sitemap](${absoluteUrl("/sitemap.xml")}): todas las URLs indexables
- [Feed RSS](${absoluteUrl("/feed.xml")}): opiniones recientes
- [robots.txt](${absoluteUrl("/robots.txt")}): permisos de crawlers

## Páginas humanas clave

- [Inicio / buscador](${absoluteUrl("/")}): buscar por nombre, teléfono, oficio o zona
- [Todos los oficios](${absoluteUrl("/oficios")}): índice de categorías
- [Publicar opinión](${absoluteUrl("/resenas/nueva")}): formulario (requiere cuenta)

## Oficios (muestra)

${oficios}

## Perfiles con más opiniones

${providersBlock}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
