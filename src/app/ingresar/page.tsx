import { LogIn } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { localAuthAllowed, supabaseConfigured } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LogIn className="size-6" aria-hidden />
      </span>
      <h1 className="text-center font-heading text-2xl">Entrar</h1>
      <p className="text-center text-base">Usa el mismo correo con el que creaste tu cuenta.</p>
      {localAuthAllowed() ? (
        <p className="rounded-xl bg-amber-100 px-4 py-3 text-center text-amber-950">
          Estás en una prueba local. Escribe tu correo para entrar. Aquí todavía no se pide contraseña.
        </p>
      ) : null}
      <AuthForm mode="login" google={supabaseConfigured()} local={localAuthAllowed()} />
    </div>
  );
}
