
import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDatabase();

    const logs = await db
      .collection("activity_logs")
      .find({})
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
      { error: "Unable to fetch activity logs" },
      { status: 500 }
    );
  }
}
