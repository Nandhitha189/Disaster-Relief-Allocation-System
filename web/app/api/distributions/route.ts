
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

interface DistributionRow extends RowDataPacket {
  Allocation_ID: number;
  Disaster_Name: string;
  Resource_Name: string;
  Unit: string;
  Allocated_Quantity: number;
  Total_Distributed: number;
  Yet_To_Distribute: number;
}

export async function GET() {
  try {
    const [rows] = await pool.query<DistributionRow[]>(`
      SELECT
        A.Allocation_ID,
        DS.Disaster_Name,
        R.Resource_Name,
        R.Unit,
        AI.Allocated_Quantity,
        COALESCE(Delivered.Total_Distributed, 0)
          AS Total_Distributed,
        AI.Allocated_Quantity -
          COALESCE(Delivered.Total_Distributed, 0)
          AS Yet_To_Distribute
      FROM Allocation A
      JOIN Aid_Request AR
        ON A.Request_ID = AR.Request_ID
      JOIN Disaster DS
        ON AR.Disaster_ID = DS.Disaster_ID
      JOIN Allocation_Item AI
        ON A.Allocation_ID = AI.Allocation_ID
      JOIN Resource R
        ON AI.Resource_ID = R.Resource_ID
      LEFT JOIN (
        SELECT
          D.Allocation_ID,
          DI.Resource_ID,
          SUM(DI.Quantity_Distributed) AS Total_Distributed
        FROM Distribution D
        JOIN Distribution_Item DI
          ON D.Distribution_ID = DI.Distribution_ID
        GROUP BY D.Allocation_ID, DI.Resource_ID
      ) Delivered
        ON Delivered.Allocation_ID = A.Allocation_ID
        AND Delivered.Resource_ID = AI.Resource_ID
      ORDER BY A.Allocation_ID, R.Resource_ID
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Distribution API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch distribution records" },
      { status: 500 }
    );
  }
}
