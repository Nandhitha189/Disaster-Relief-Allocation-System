
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";

const priorities = ["Low", "Medium", "High", "Critical"];

function positiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= 2147483647
  );
}

export async function POST(request: NextRequest) {
  // Only allow local development until authentication is implemented.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This operation is unavailable in production." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON data." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request data." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  if (
    !positiveInteger(data.center_id) ||
    !positiveInteger(data.disaster_id)
  ) {
    return NextResponse.json(
      { error: "Enter valid relief center and disaster IDs." },
      { status: 400 }
    );
  }

  if (
    typeof data.priority !== "string" ||
    !priorities.includes(data.priority)
  ) {
    return NextResponse.json(
      { error: "Invalid priority." },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0 ||
    data.items.length > 20
  ) {
    return NextResponse.json(
      { error: "Enter between 1 and 20 resource items." },
      { status: 400 }
    );
  }

  const resourceIds = new Set<number>();

  for (const rawItem of data.items) {
    if (!rawItem || typeof rawItem !== "object") {
      return NextResponse.json(
        { error: "Invalid resource item." },
        { status: 400 }
      );
    }

    const item = rawItem as Record<string, unknown>;

    if (
      !positiveInteger(item.resource_id) ||
      !positiveInteger(item.quantity_requested)
    ) {
      return NextResponse.json(
        { error: "Resource IDs and quantities must be positive integers." },
        { status: 400 }
      );
    }

    if (resourceIds.has(item.resource_id)) {
      return NextResponse.json(
        { error: "Duplicate resources are not allowed." },
        { status: 400 }
      );
    }

    resourceIds.add(item.resource_id);
  }

  const items = data.items as {
    resource_id: number;
    quantity_requested: number;
  }[];

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [centers] = await connection.execute<RowDataPacket[]>(
      "SELECT Center_ID FROM Relief_Center WHERE Center_ID = ?",
      [data.center_id]
    );

    if (centers.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Relief center not found." },
        { status: 400 }
      );
    }

    const [disasters] = await connection.execute<RowDataPacket[]>(
      "SELECT Disaster_ID FROM Disaster WHERE Disaster_ID = ?",
      [data.disaster_id]
    );

    if (disasters.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Disaster not found." },
        { status: 400 }
      );
    }

    for (const item of items) {
      const [resources] = await connection.execute<RowDataPacket[]>(
        "SELECT Resource_ID FROM Resource WHERE Resource_ID = ?",
        [item.resource_id]
      );

      if (resources.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: `Resource ID ${item.resource_id} not found.` },
          { status: 400 }
        );
      }
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO Aid_Request
         (Center_ID, Disaster_ID, Priority, Status)
       VALUES (?, ?, ?, 'Pending')`,
      [data.center_id, data.disaster_id, data.priority]
    );

    const requestId = result.insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO Request_Item
         (Request_ID, Resource_ID, Quantity_Requested, Quantity_Allocated)
         VALUES (?, ?, ?, 0)`,
        [
          requestId,
          item.resource_id,
          item.quantity_requested,
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        message: "Aid request created successfully.",
        request_id: requestId,
        status: "Pending",
        items_created: items.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Create aid request error:", error);

    return NextResponse.json(
      { error: "Failed to create aid request." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
