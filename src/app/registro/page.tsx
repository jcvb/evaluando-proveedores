import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { localAuthAllowed, supabaseConfigured } from "@/lib/env";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: noIndexRobots,
};

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserPlus className="size-6" aria-hidden />
      </span>
      <h1 className="text-center font-heading text-2xl">Crear cuenta</h1>
      <p className="text-center text-base">Con una cuenta puedes publicar tu experiencia y seguirla después.</p>
      {localAuthAllowed() ? (
        <p className="rounded-xl bg-amber-100 px-4 py-3 text-center text-amber-950">
          Estás en una prueba local. Basta con tu nombre y tu correo.
        </p>
      ) : null}
      <AuthForm mode="register" google={supabaseConfigured()} local={localAuthAllowed()} />
    </div>
  );
}
