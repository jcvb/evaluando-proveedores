import { NextResponse } from "next/server";
import { syncSupabaseUser } from "@/server/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  if (code) {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        await syncSupabaseUser(data.user);
      }
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
