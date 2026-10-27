"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Globe, LoaderCircle, LogIn, Mail, TriangleAlert, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, loginWithGoogleAction, registerAction, type AuthState } from "@/server/actions/auth";

export function AuthForm({ mode, google, local = false }: { mode: "login" | "register"; google: boolean; local?: boolean }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, null as AuthState);

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <form action={formAction} className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        {mode === "register" ? (
          <div>
            <Label htmlFor="name">Tu nombre</Label>
            <Input id="name" name="name" required autoComplete="name" className="mt-1.5" />
          </div>
        ) : null}
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
        </div>
        {local ? null : (
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <p className="mt-1">Mínimo 8 caracteres.</p>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-1.5" />
          </div>
        )}
        {state?.error ? (
          <p className="flex items-start gap-2 text-base text-destructive">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            {state.error}
          </p>
        ) : null}
        {state?.message ? (
          <p className="flex items-start gap-2 text-base text-primary">
            <Mail className="mt-0.5 size-5 shrink-0" aria-hidden />
            {state.message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : mode === "login" ? (
            <LogIn aria-hidden />
          ) : (
            <UserPlus aria-hidden />
          )}
          {pending ? "Espera un momento…" : mode === "login" ? "Entrar" : "Crear mi cuenta"}
        </Button>
        <p className="text-base">
          {mode === "login" ? (
            <Link href="/registro" className="font-semibold underline">
              No tengo cuenta. Quiero crearla.
            </Link>
          ) : (
            <Link href="/ingresar" className="font-semibold underline">
              Ya tengo cuenta. Quiero entrar.
            </Link>
          )}
        </p>
      </form>
      {google ? (
        <form action={loginWithGoogleAction}>
          <Button type="submit" variant="outline" className="w-full">
            <Globe aria-hidden />
            Entrar con Google
          </Button>
        </form>
      ) : null}
    </div>
  );
}
