import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const cookieName = "bookit_session";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(value);
}
export type SessionUser = { id: string; name: string; email: string; role: Role };
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt()
    .setExpirationTime("7d").sign(secret());
  const jar = await cookies();
  jar.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function destroySession() {
  const jar = await cookies();
  jar.delete(cookieName);
}
export async function getSession(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, role: true } });
    return user ?? null;
  } catch { return null; }
}
export async function requireRole(...roles: Role[]) {
  const user = await getSession();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}
