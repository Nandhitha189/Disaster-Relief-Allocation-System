
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

interface AidRequest extends RowDataPacket {
  Request_ID: number;
  Center_Name: string;
  Disaster_Name: string;
  Priority: string;
  Status: string;
  Resource_Name: string;
  Quantity_Requested: number;
  Quantity_Allocated: number;
}

export async function GET() {
  try {
    const [rows] = await pool.query<AidRequest[]>(`
      SELECT
        AR.Request_ID,
        RC.Center_Name,
        D.Disaster_Name,
        AR.Priority,
        AR.Status,
        R.Resource_Name,
        RI.Quantity_Requested,
        RI.Quantity_Allocated
      FROM Aid_Request AR
      JOIN Relief_Center RC
        ON AR.Center_ID = RC.Center_ID
      JOIN Disaster D
        ON AR.Disaster_ID = D.Disaster_ID
      JOIN Request_Item RI
        ON AR.Request_ID = RI.Request_ID
      JOIN Resource R
        ON RI.Resource_ID = R.Resource_ID
      ORDER BY
        FIELD(AR.Priority, 'Critical', 'High', 'Medium', 'Low'),
        AR.Request_ID,
        R.Resource_ID
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Aid requests API error:", error);

    return NextResponse.json(
      { error: "Unable to fetch aid requests" },
      { status: 500 }
    );
  }
}
