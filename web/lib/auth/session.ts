
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "Admin" | "Coordinator" | "Viewer";

export type SessionUser = {
  userId: number;
  username: string;
  role: UserRole;
};

export const SESSION_COOKIE = "disaster_relief_session";

const SESSION_SECONDS = 60 * 60 * 8;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  user: SessionUser
): Promise<string> {
  return new SignJWT({
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.userId))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    const userId = Number(payload.sub);
    const username = payload.username;
    const role = payload.role;

    if (
      !Number.isSafeInteger(userId) ||
      userId <= 0 ||
      typeof username !== "string" ||
      !username ||
      (role !== "Admin" &&
        role !== "Coordinator" &&
        role !== "Viewer")
    ) {
      return null;
    }

    return {
      userId,
      username,
      role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
};
