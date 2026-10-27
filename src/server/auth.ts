import type { User as AuthUser } from "@supabase/supabase-js";
import { isAdminEmail, supabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase/server";
import { localUserIdFromCookie } from "@/server/session";

export async function syncSupabaseUser(authUser: AuthUser) {
  const email = authUser.email?.toLowerCase();
  if (!email) return null;
  const meta = authUser.user_metadata ?? {};
  const name =
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    email.split("@")[0];
  const admin = isAdminEmail(email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    return prisma.user.create({
      data: {
        email,
        name,
        authUserId: authUser.id,
        role: admin ? "ADMIN" : "CLIENT",
      },
    });
  }
  return prisma.user.update({
    where: { id: existing.id },
    data: {
      authUserId: authUser.id,
      role: existing.role === "ADMIN" || admin ? "ADMIN" : existing.role,
    },
  });
}

export async function getCurrentUser() {
  if (!process.env.DATABASE_URL) return null;
  try {
    if (supabaseConfigured()) {
      const supabase = await createServerSupabase();
      const { data } = await supabase!.auth.getUser();
      if (!data.user) return null;
      return syncSupabaseUser(data.user);
    }
    const userId = await localUserIdFromCookie();
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Inicia sesión para continuar");
  return user;
}
