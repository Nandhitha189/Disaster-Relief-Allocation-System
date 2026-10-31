
import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDatabase();

    const updates = await db
      .collection("supply_updates")
      .find({})
      .limit(100)
      .toArray();

    return NextResponse.json(
      updates.map((update) => ({
        ...update,
        _id: update._id.toString(),
      }))
    );
  } catch (error) {
    console.error("Supply updates error:", error);

    return NextResponse.json(
      { error: "Unable to fetch supply updates" },
      { status: 500 }
    );
  }
}
