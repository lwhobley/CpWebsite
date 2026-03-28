import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AppUser, Role } from "@/lib/types";

const SESSION_COOKIE = "enish_ops_session";

type SessionPayload = {
  sub: string;
  name: string;
  role: Role;
  locationId: string;
  email?: string | null;
};

function getSecret() {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error("AUTH_SECRET is required.");
  }

  return new TextEncoder().encode(authSecret);
}

export async function createSession(user: AppUser) {
  const cookieStore = await cookies();
  const token = await new SignJWT({
    name: user.name,
    role: user.role,
    locationId: user.locationId,
    email: user.email,
  } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.sub as string,
      name: payload.name as string,
      role: payload.role as Role,
      locationId: payload.locationId as string,
      email: (payload.email as string | null | undefined) ?? null,
      active: true,
    } satisfies AppUser;
  } catch {
    return null;
  }
}
