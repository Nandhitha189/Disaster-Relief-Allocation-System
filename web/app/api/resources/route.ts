
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

interface ResourceRow extends RowDataPacket {
  Resource_ID: number;
  Resource_Name: string;
  Category: string;
  Unit: string;
  Available_Quantity: number;
  Minimum_Stock: number;
  Stock_Status: string;
}

export async function GET() {
  try {
    const [resources] = await pool.query<ResourceRow[]>(`
      SELECT
        Resource_ID,
        Resource_Name,
        Category,
        Unit,
        Available_Quantity,
        Minimum_Stock,
        CASE
          WHEN Available_Quantity = 0 THEN 'Out of Stock'
          WHEN Available_Quantity <= Minimum_Stock THEN 'Low Stock'
          ELSE 'Available'
        END AS Stock_Status
      FROM Resource
      ORDER BY Resource_ID
    `);

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Resource API error:", error);

    return NextResponse.json(
      { error: "Unable to fetch resources" },
      { status: 500 }
    );
  }
}
