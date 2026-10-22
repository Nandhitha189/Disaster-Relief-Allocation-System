
import "server-only";

import { NextResponse } from "next/server";
import { getSession, type UserRole } from "./session";

export type Permission =
  | "create_request"
  | "allocate_resources"
  | "record_distribution";

const permissions: Record<UserRole, Permission[]> = {
  Admin: [
    "create_request",
    "allocate_resources",
    "record_distribution",
  ],
  Coordinator: [
    "create_request",
    "record_distribution",
  ],
  Viewer: [],
};

export async function requirePermission(
  permission: Permission
): Promise<NextResponse | null> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to continue." },
      { status: 401 }
    );
  }

  if (!permissions[session.role].includes(permission)) {
    return NextResponse.json(
      { error: "You do not have permission for this operation." },
      { status: 403 }
    );
  }

  return null;
}
