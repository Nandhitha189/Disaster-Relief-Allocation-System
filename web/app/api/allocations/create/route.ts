
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";

interface AidRequestRow extends RowDataPacket {
  Request_ID: number;
  Status: string;
}

interface RequestItemRow extends RowDataPacket {
  Resource_ID: number;
  Quantity_Requested: number;
  Quantity_Allocated: number;
}

interface ResourceRow extends RowDataPacket {
  Resource_ID: number;
  Available_Quantity: number;
}

export async function POST(request: NextRequest) {
  // Development only: authentication is not implemented yet.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Allocation is unavailable in production." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON input." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const requestId = (body as { request_id?: unknown }).request_id;

  if (
    typeof requestId !== "number" ||
    !Number.isSafeInteger(requestId) ||
    requestId <= 0 ||
    requestId > 2147483647
  ) {
    return NextResponse.json(
      { error: "Enter a valid request ID." },
      { status: 400 }
    );
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Lock this request so it cannot be allocated twice concurrently.
    const [requests] = await connection.query<AidRequestRow[]>(
      `SELECT Request_ID, Status
       FROM Aid_Request
       WHERE Request_ID = ?
       FOR UPDATE`,
      [requestId]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Aid request does not exist." },
        { status: 404 }
      );
    }

    const currentStatus = requests[0].Status;

    if (
      currentStatus !== "Pending" &&
      currentStatus !== "Partially Allocated"
    ) {
      await connection.rollback();
      return NextResponse.json(
        { error: `Request cannot be allocated. Status: ${currentStatus}` },
        { status: 409 }
      );
    }

    const [items] = await connection.query<RequestItemRow[]>(
      `SELECT
         Resource_ID,
         Quantity_Requested,
         Quantity_Allocated
       FROM Request_Item
       WHERE Request_ID = ?
       ORDER BY Resource_ID
       FOR UPDATE`,
      [requestId]
    );

    if (items.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "No resource items found for this request." },
        { status: 400 }
      );
    }

    const allocations: {
      resource_id: number;
      allocated_now: number;
    }[] = [];

    // Resources are locked in ID order to reduce deadlock risk.
    for (const item of items) {
      const remaining =
        item.Quantity_Requested - item.Quantity_Allocated;

      if (remaining <= 0) continue;

      const [resources] = await connection.query<ResourceRow[]>(
        `SELECT Resource_ID, Available_Quantity
         FROM Resource
         WHERE Resource_ID = ?
         FOR UPDATE`,
        [item.Resource_ID]
      );

      if (resources.length === 0) {
        throw new Error(
          `Resource ${item.Resource_ID} is missing.`
        );
      }

      const available = resources[0].Available_Quantity;
      const allocateNow = Math.min(remaining, available);

      if (allocateNow <= 0) continue;

      allocations.push({
        resource_id: item.Resource_ID,
        allocated_now: allocateNow,
      });
    }

    if (allocations.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "No available stock for the outstanding items." },
        { status: 409 }
      );
    }

    const [allocationResult] =
      await connection.execute<ResultSetHeader>(
        `INSERT INTO Allocation
           (Request_ID, Allocation_Status)
         VALUES (?, 'Approved')`,
        [requestId]
      );

    const allocationId = allocationResult.insertId;

    for (const item of allocations) {
      await connection.execute(
        `INSERT INTO Allocation_Item
           (Allocation_ID, Resource_ID, Allocated_Quantity)
         VALUES (?, ?, ?)`,
        [
          allocationId,
          item.resource_id,
          item.allocated_now,
        ]
      );

      await connection.execute(
        `UPDATE Resource
         SET Available_Quantity =
           Available_Quantity - ?
         WHERE Resource_ID = ?
           AND Available_Quantity >= ?`,
        [
          item.allocated_now,
          item.resource_id,
          item.allocated_now,
        ]
      );

      await connection.execute(
        `UPDATE Request_Item
         SET Quantity_Allocated =
           Quantity_Allocated + ?
         WHERE Request_ID = ?
           AND Resource_ID = ?`,
        [
          item.allocated_now,
          requestId,
          item.resource_id,
        ]
      );
    }

    const [remainingRows] =
      await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS outstanding_items
         FROM Request_Item
         WHERE Request_ID = ?
           AND Quantity_Allocated < Quantity_Requested`,
        [requestId]
      );

    const outstandingItems =
      Number(remainingRows[0].outstanding_items);

    const newStatus =
      outstandingItems === 0
        ? "Allocated"
        : "Partially Allocated";

    await connection.execute(
      `UPDATE Aid_Request
       SET Status = ?
       WHERE Request_ID = ?`,
      [newStatus, requestId]
    );

    await connection.commit();

    return NextResponse.json(
      {
        message: "Resources allocated successfully.",
        request_id: requestId,
        allocation_id: allocationId,
        status: newStatus,
        allocated_items: allocations,
        outstanding_items: outstandingItems,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Allocation rollback failed:", rollbackError);
      }
    }

    console.error("Resource allocation error:", error);

    return NextResponse.json(
      { error: "Resource allocation failed." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
