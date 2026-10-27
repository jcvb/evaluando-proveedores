import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "local_session";

function secret() {
  return process.env.SESSION_SECRET || "desarrollo-local-cambiar";
}

export function signUserId(userId: string) {
  const mac = createHmac("sha256", secret()).update(userId).digest("base64url");
  return `${userId}.${mac}`;
}

export function readUserId(token: string) {
  const [userId, mac] = token.split(".");
  if (!userId || !mac) return null;
  const expected = createHmac("sha256", secret()).update(userId).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return userId;
}

export async function setLocalSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, signUserId(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearLocalSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function localUserIdFromCookie() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return readUserId(token);
}
