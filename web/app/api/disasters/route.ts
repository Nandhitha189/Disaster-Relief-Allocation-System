import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT
         Disaster_ID,
         Disaster_Name,
         Disaster_Type,
         Location,
         Start_Date,
         Severity,
         Status
       FROM Disaster
       ORDER BY Start_Date DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("MySQL error:", error);

    return NextResponse.json(
      { error: "Failed to fetch disaster data" },
      { status: 500 }
    );
  }
}