import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/seo";

const explore = [
  { href: "/oficios", label: "Oficios" },
  { href: "/resenas/nueva", label: "Publicar opinión" },
  { href: "/proveedor/reclamar", label: "Reclamar mi negocio" },
  { href: "/ingresar", label: "Entrar" },
] as const;

const legal = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/aviso-privacidad", label: "Aviso de privacidad" },
] as const;

const forAgents = [
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/feed.xml", label: "Feed RSS" },
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "/contexto.md", label: "Contexto" },
] as const;

const linkClass =
  "text-[0.95rem] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#163a2d]";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-[#1a4a36] bg-[#163a2d] text-white">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div className="grid gap-4 self-start">
          <Link href="/" className="inline-flex w-fit" aria-label={`${SITE.name} — inicio`}>
            <Image
              src="/brand/logo-footer-sm.png"
              alt={SITE.name}
              width={207}
              height={96}
              className="h-16 w-auto rounded-xl shadow-sm ring-1 ring-white/10 sm:h-[4.5rem]"
              priority={false}
            />
          </Link>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-white/75">{SITE.tagline}</p>
          <p className="max-w-sm text-sm leading-relaxed text-white/55">
            Cada opinión lleva al menos una foto. El negocio puede responder; nadie borra lo escrito.
          </p>
          <a href={`mailto:${SITE.legalEmail}`} className={`${linkClass} w-fit underline-offset-2 hover:underline`}>
            {SITE.legalEmail}
          </a>
        </div>

        <nav aria-label="Explorar" className="grid gap-3 self-start">
          <p className="text-sm font-semibold tracking-wide text-white/90">Explorar</p>
          <ul className="grid gap-2">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Legal" className="grid gap-3 self-start">
          <p className="text-sm font-semibold tracking-wide text-white/90">Legal</p>
          <ul className="grid gap-2">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Para buscadores y agentes" className="grid gap-3 self-start">
          <p className="text-sm font-semibold tracking-wide text-white/90">Descubrimiento</p>
          <ul className="grid gap-2">
            {forAgents.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. México.
          </p>
          <p>
            <a href={SITE.canonicalOrigin} className="hover:text-white/80">
              www.burodeoficios.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
