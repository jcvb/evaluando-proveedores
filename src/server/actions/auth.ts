"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminEmail, localAuthAllowed, siteOrigin, supabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase/server";
import { clearLocalSession, setLocalSession } from "@/server/session";

export type AuthState = { error?: string; message?: string } | null;

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2) return { error: "Escribe tu nombre" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "El correo no es válido" };
  if (supabaseConfigured() && password.length < 8) return { error: "La contraseña necesita al menos 8 caracteres" };

  if (supabaseConfigured()) {
    const supabase = await createServerSupabase();
    const origin = (await headers()).get("origin") ?? siteOrigin();
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
    if (!data.session) {
      return { message: "Te enviamos un correo para confirmar la cuenta. Después ya puedes entrar." };
    }
    redirect("/");
  }

  if (!localAuthAllowed()) {
    return { error: "Configura Supabase para crear cuentas." };
  }
  if (!process.env.DATABASE_URL) return { error: "Falta DATABASE_URL" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ese correo ya tiene cuenta. Entra con él." };
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: isAdminEmail(email) ? "ADMIN" : "CLIENT",
    },
  });
  await setLocalSession(user.id);
  redirect("/");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = clean(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email) return { error: "Escribe tu correo" };
  if (supabaseConfigured() && password.length < 8) return { error: "Revisa correo y contraseña" };

  if (supabaseConfigured()) {
    const supabase = await createServerSupabase();
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) return { error: "Correo o contraseña incorrectos" };
    redirect("/");
  }

  if (!localAuthAllowed()) return { error: "Configura Supabase para entrar." };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No hay una cuenta con ese correo" };
  await setLocalSession(user.id);
  redirect("/");
}

export async function loginWithGoogleAction() {
  if (!supabaseConfigured()) return;
  const supabase = await createServerSupabase();
  const origin = (await headers()).get("origin") ?? siteOrigin();
  const { data, error } = await supabase!.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) return;
  redirect(data.url);
}

export async function logoutAction() {
  if (supabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase?.auth.signOut();
  }
  await clearLocalSession();
  redirect("/");
}
