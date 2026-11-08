import Link from "next/link";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <header className="grid gap-2 border-b border-border pb-4">
        <h1 className="font-heading text-2xl md:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {updatedAt}</p>
      </header>
      <div className="legal-prose grid gap-5 text-[0.98rem] leading-relaxed text-foreground [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-xl [&_h3]:font-heading [&_h3]:text-lg [&_ol]:grid [&_ol]:list-decimal [&_ol]:gap-2 [&_ol]:pl-5 [&_p]:text-foreground/95 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-5">
        {children}
      </div>
      <nav aria-label="Documentos legales" className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 text-sm">
        <Link href="/terminos" className="text-primary underline">
          Términos y condiciones
        </Link>
        <Link href="/aviso-privacidad" className="text-primary underline">
          Aviso de privacidad
        </Link>
        <Link href="/" className="underline">
          Volver al inicio
        </Link>
      </nav>
    </article>
  );
}
