
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

interface CountRow extends RowDataPacket {
  total: number;
}

export async function GET() {
  try {
    const [disasters] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Disaster WHERE Status = 'Active'"
    );

    const [centers] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Relief_Center"
    );

    const [requests] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Aid_Request WHERE Status = 'Partially Allocated'"
    );

    const [distributions] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Distribution"
    );

    return NextResponse.json({
      activeDisasters: disasters[0].total,
      reliefCenters: centers[0].total,
      partialRequests: requests[0].total,
      distributions: distributions[0].total,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
