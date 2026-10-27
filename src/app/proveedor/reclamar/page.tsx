import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { ClaimPanel } from "@/components/claim-panel";
import { supabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/server/auth";
import { getProvider } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/proveedor/reclamar");
  const params = await searchParams;
  let preset: { id: string; businessName: string; phonePrimary: string } | null = null;
  if (params.perfil) {
    try {
      const provider = await getProvider(params.perfil);
      if (provider && !provider.isClaimed) {
        preset = { id: provider.id, businessName: provider.businessName, phonePrimary: provider.phonePrimary };
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mx-auto grid max-w-xl gap-4 px-4 py-8">
      <h1 className="flex items-center gap-2 font-heading text-2xl">
        <Store className="size-6 text-primary" aria-hidden />
        Este es mi negocio
      </h1>
      <p className="text-base">
        Si el teléfono del anuncio es el tuyo, puedes responder cada opinión una vez. Las opiniones se quedan: no se pueden borrar.
      </p>
      <ClaimPanel preset={preset} smsAvailable={supabaseConfigured()} />
    </div>
  );
}
