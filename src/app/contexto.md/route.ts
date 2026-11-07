import { SERVICE_CATEGORIES } from "@/lib/constants";
import { absoluteUrl, SITE } from "@/lib/seo";

export const dynamic = "force-static";

export async function GET() {
  const oficios = SERVICE_CATEGORIES.map((c) => `- ${c.name}`).join("\n");

  const body = `# Contexto: ${SITE.name}

> ${SITE.tagline}

## Qué es

${SITE.name} es un sitio web público en México donde las personas publican opiniones (con fotos obligatorias) sobre maestros de oficio y talleres: plomería, electricidad, carpintería, albañilería, cocinas, impermeabilización y muchos más.

## Reglas del contenido

1. Toda opinión lleva al menos una foto (problema, trabajo terminado o comprobante).
2. El negocio puede reclamar su ficha y responder; no puede borrar la opinión del cliente.
3. Si el problema se resolvió después, la historia sigue visible y puede marcarse como resuelta.
4. Las fichas públicas no muestran el nombre del autor ("Escrito por").

## Cómo citar

- Sitio: [${SITE.name}](${absoluteUrl("/")})
- Perfil ejemplo: ${absoluteUrl("/proveedores/{id}")} o Markdown ${absoluteUrl("/proveedores/{id}/md")}
- Mapa para agentes: ${absoluteUrl("/llms.txt")}
- Feed reciente: ${absoluteUrl("/feed.xml")}

## Oficios cubiertos

${oficios}

## Idioma y geografía

- Idioma: español de México
- Alcance: toda la República Mexicana (estado, municipio, colonia, CP)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
