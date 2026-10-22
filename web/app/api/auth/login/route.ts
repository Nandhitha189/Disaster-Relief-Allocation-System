
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";

import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  type UserRole,
} from "@/lib/auth/session";

interface UserRow extends RowDataPacket {
  User_ID: number;
  Username: string;
  Password_Hash: string;
  Role: UserRole;
  Is_Active: number;
}

export async function POST(request: NextRequest) {
  // Keep this initial login implementation in development only.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Login is not enabled for production." },
      { status: 403 }
    );
  }

  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid login data." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.username !== "string" ||
    typeof data.password !== "string" ||
    data.username.trim().length === 0 ||
    data.username.trim().length > 50 ||
    data.password.length === 0 ||
    data.password.length > 1024
  ) {
    return NextResponse.json(
      { error: "Enter a valid username and password." },
      { status: 400 }
    );
  }

  try {
    const [users] = await pool.execute<UserRow[]>(
      `SELECT
         User_ID,
         Username,
         Password_Hash,
         Role,
         Is_Active
       FROM App_User
       WHERE Username = ?
       LIMIT 1`,
      [data.username.trim()]
    );

    const user = users[0];

    if (!user || !user.Is_Active) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(
      data.password,
      user.Password_Hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const sessionUser = {
      userId: user.User_ID,
      username: user.Username,
      role: user.Role,
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      message: "Login successful.",
      user: sessionUser,
    });

    response.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Unable to sign in." },
      { status: 500 }
    );
  }
}
