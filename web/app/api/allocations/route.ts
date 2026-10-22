
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

interface AllocationRow extends RowDataPacket {
  Allocation_ID: number;
  Request_ID: number;
  Disaster_Name: string;
  Center_Name: string;
  Priority: string;
  Request_Status: string;
  Allocation_Status: string;
  Resource_Name: string;
  Allocated_Quantity: number;
  Unit: string;
}

export async function GET() {
  try {
    const [rows] = await pool.query<AllocationRow[]>(`
      SELECT
        A.Allocation_ID,
        A.Request_ID,
        D.Disaster_Name,
        RC.Center_Name,
        AR.Priority,
        AR.Status AS Request_Status,
        A.Allocation_Status,
        R.Resource_Name,
        AI.Allocated_Quantity,
        R.Unit
      FROM Allocation A
      JOIN Aid_Request AR
        ON A.Request_ID = AR.Request_ID
      JOIN Disaster D
        ON AR.Disaster_ID = D.Disaster_ID
      JOIN Relief_Center RC
        ON AR.Center_ID = RC.Center_ID
      JOIN Allocation_Item AI
        ON A.Allocation_ID = AI.Allocation_ID
      JOIN Resource R
        ON AI.Resource_ID = R.Resource_ID
      ORDER BY
        FIELD(AR.Priority, 'Critical', 'High', 'Medium', 'Low'),
        A.Allocation_ID,
        R.Resource_ID
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Allocation API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch allocations" },
      { status: 500 }
    );
  }
}
