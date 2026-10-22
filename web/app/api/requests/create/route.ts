
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import pool from "@/lib/mysql";
import { requirePermission } from "@/lib/auth/permissions";

type Priority = "Low" | "Medium" | "High" | "Critical";

interface CenterRow extends RowDataPacket {
  Center_ID: number;
  Disaster_ID: number;
}

interface ExistingRow extends RowDataPacket {
  Resource_ID: number;
}

interface RequestItem {
  resource_id: number;
  quantity_requested: number;
}

function validId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= 2147483647
  );
}

export async function POST(request: NextRequest) {
  // Disable this prototype write endpoint in production.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Aid request creation is disabled in production." },
      { status: 403 }
    );
  }

  // Authorization must be INSIDE the POST function.
  const authorizationError = await requirePermission(
    "create_request"
  );

  if (authorizationError) {
    return authorizationError;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  const centerId = data.center_id;
  const disasterId = data.disaster_id;
  const priority = data.priority;

  if (!validId(centerId) || !validId(disasterId)) {
    return NextResponse.json(
      { error: "Enter valid center and disaster IDs." },
      { status: 400 }
    );
  }

  const validPriorities: Priority[] = [
    "Low",
    "Medium",
    "High",
    "Critical",
  ];

  if (
    typeof priority !== "string" ||
    !validPriorities.includes(priority as Priority)
  ) {
    return NextResponse.json(
      { error: "Invalid request priority." },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length < 1 ||
    data.items.length > 20
  ) {
    return NextResponse.json(
      { error: "Enter between 1 and 20 resource items." },
      { status: 400 }
    );
  }

  const items: RequestItem[] = [];
  const seenResourceIds = new Set<number>();

  for (const rawItem of data.items) {
    if (
      !rawItem ||
      typeof rawItem !== "object" ||
      Array.isArray(rawItem)
    ) {
      return NextResponse.json(
        { error: "Invalid resource item." },
        { status: 400 }
      );
    }

    const item = rawItem as Record<string, unknown>;

    if (
      !validId(item.resource_id) ||
      !validId(item.quantity_requested)
    ) {
      return NextResponse.json(
        { error: "Resource IDs and quantities must be positive integers." },
        { status: 400 }
      );
    }

    if (seenResourceIds.has(item.resource_id)) {
      return NextResponse.json(
        { error: "Duplicate resources are not allowed." },
        { status: 400 }
      );
    }

    seenResourceIds.add(item.resource_id);

    items.push({
      resource_id: item.resource_id,
      quantity_requested: item.quantity_requested,
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify that the center exists and belongs to this disaster.
    const [centers] = await connection.query<CenterRow[]>(
      `SELECT Center_ID, Disaster_ID
       FROM Relief_Center
       WHERE Center_ID = ?`,
      [centerId]
    );

    if (centers.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Relief center not found." },
        { status: 404 }
      );
    }

    if (Number(centers[0].Disaster_ID) !== disasterId) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Relief center does not belong to this disaster." },
        { status: 400 }
      );
    }

    // Verify that the disaster exists.
    const [disasters] = await connection.query<RowDataPacket[]>(
      `SELECT Disaster_ID
       FROM Disaster
       WHERE Disaster_ID = ?`,
      [disasterId]
    );

    if (disasters.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Disaster not found." },
        { status: 404 }
      );
    }

    // Verify every resource exists before inserting the request.
    for (const item of items) {
      const [resources] = await connection.query<ExistingRow[]>(
        `SELECT Resource_ID
         FROM Resource
         WHERE Resource_ID = ?`,
        [item.resource_id]
      );

      if (resources.length === 0) {
        await connection.rollback();

        return NextResponse.json(
          { error: `Resource ${item.resource_id} not found.` },
          { status: 404 }
        );
      }
    }

    // Insert the aid request.
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO Aid_Request
         (Center_ID, Disaster_ID, Priority, Status)
       VALUES (?, ?, ?, 'Pending')`,
      [centerId, disasterId, priority]
    );

    const requestId = result.insertId;

    // Insert all requested resource items.
    for (const item of items) {
      await connection.execute(
        `INSERT INTO Request_Item
           (
             Request_ID,
             Resource_ID,
             Quantity_Requested,
             Quantity_Allocated
           )
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

    console.error("Aid request creation error:", error);

    return NextResponse.json(
      { error: "Unable to create aid request." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
