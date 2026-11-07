import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** Permite indexación web y crawlers de búsqueda / agentes de IA. */
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/feed.xml", "/oficios", "/proveedores"],
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/admin/", "/cuenta", "/mis-resenas", "/ingresar", "/registro", "/auth/"],
      },
    ],
    sitemap,
    host: absoluteUrl("/"),
  };
}
