import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Atkinson_Hyperlegible } from "next/font/google";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/json-ld";
import { NavigationLoading } from "@/components/navigation-loading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/seo";
import { getCurrentUser } from "@/server/auth";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-source",
});

const siteUrl = SITE.canonicalOrigin.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: siteUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [...SITE.keywords],
  category: "business",
  classification: "Directorio de opiniones de oficios en México",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: {
    canonical: "/",
    languages: { "es-MX": "/", es: "/" },
    types: {
      "application/rss+xml": "/feed.xml",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: siteUrl,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : {}),
    },
  },
  other: {
    "ai-content": "human-authored reviews with photos about Mexican trade providers",
    "llms-txt": `${siteUrl}/llms.txt`,
  },
};

export const viewport: Viewport = {
  themeColor: "#1f5c45",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: siteUrl,
    description: SITE.description,
    areaServed: { "@type": "Country", name: "México" },
    knowsAbout: ["oficios", "reseñas", "maestros", "talleres", "México"],
    sameAs: [],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: siteUrl,
    description: SITE.description,
    inLanguage: SITE.language,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="es-MX" className={atkinson.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <JsonLd data={[organizationLd, websiteLd]} />
        <Suspense fallback={null}>
          <NavigationLoading />
        </Suspense>
        <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
        <main>{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
