import Link from "next/link";

export default function ProviderNotFound() {
  return (
    <div className="mx-auto grid max-w-xl gap-3 px-4 py-16">
      <h1 className="font-heading text-2xl">No encontramos este negocio</h1>
      <p className="text-base">El enlace puede estar incompleto, o este negocio todavía no tiene ficha.</p>
      <Link href="/" className="text-base font-semibold underline">
        Volver a buscar
      </Link>
    </div>
  );
}
