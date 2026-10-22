
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

type UserRole = "Admin" | "Coordinator" | "Viewer";

const COOKIE_NAME = "disaster_relief_session";

async function getProxySession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        algorithms: ["HS256"],
      }
    );

    const role = payload.role;

    if (
      !payload.sub ||
      typeof payload.username !== "string" ||
      (role !== "Admin" &&
        role !== "Coordinator" &&
        role !== "Viewer")
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: role as UserRole,
    };
  } catch {
    return null;
  }
}

// Next.js 16 requires this named export.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await getProxySession(request);

  // Redirect users without valid sessions to login.
  if (!session) {
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl);
  }

  // Only Admin can access the resource allocation form.
  if (
    pathname === "/allocations/new" &&
    session.role !== "Admin"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  // Viewers cannot access resource modification forms.
  if (session.role === "Viewer") {
    const restrictedPages = [
      "/requests/new",
      "/distributions/new",
    ];

    if (restrictedPages.includes(pathname)) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/disasters/:path*",
    "/resources/:path*",
    "/requests/:path*",
    "/allocations/:path*",
    "/distributions/:path*",
    "/field-reports/:path*",
    "/activity-logs/:path*",
    "/supply-updates/:path*",
  ],
};
