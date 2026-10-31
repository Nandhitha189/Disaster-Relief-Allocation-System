
import { NextResponse } from "next/server";

import { getMongoDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to view activity logs." },
      { status: 401 }
    );
  }

  try {
    const database = await getMongoDatabase();

    const logs = await database
      .collection("activity_logs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(
      logs.map((log) => ({
        ...log,
        _id: log._id.toString(),
      }))
    );
  } catch (error) {
    console.error("Activity logs error:", error);

    return NextResponse.json(
      { error: "Unable to fetch activity logs." },
      { status: 500 }
    );
  }
}
