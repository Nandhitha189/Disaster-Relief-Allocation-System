
import { NextResponse } from "next/server";
import { getMongoDatabase } from "@/lib/mongodb";


export async function GET() {
  try {
    const db = await getMongoDatabase();

    const reports = await db
      .collection("field_reports")
      .find({})
      .limit(100)
      .toArray();

    return NextResponse.json(
      reports.map((report) => ({
        ...report,
        _id: report._id.toString(),
      }))
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return NextResponse.json(
      { error: "Unable to fetch field reports" },
      { status: 500 }
    );
  }
}
