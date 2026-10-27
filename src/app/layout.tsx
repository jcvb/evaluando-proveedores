import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/server/auth";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-source",
});

export const metadata: Metadata = {
  title: "Buró de oficios",
  description: "Opiniones con fotos de maestros y talleres en México, antes de contratar.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="es" className={atkinson.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
        <main>{children}</main>
        <footer className="mx-auto max-w-5xl border-t border-border px-4 py-6 text-sm text-muted-foreground">
          Cada opinión lleva al menos una foto. Si el problema ya se arregló, la historia sigue visible.
        </footer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
