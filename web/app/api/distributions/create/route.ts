
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import pool from "@/lib/mysql";
import { requirePermission } from "@/lib/auth/permissions";

interface AllocationRow extends RowDataPacket {
  Allocation_ID: number;
  Center_ID: number;
  Disaster_ID: number;
  Allocation_Status: string;
}

interface BeneficiaryRow extends RowDataPacket {
  Beneficiary_ID: number;
  Center_ID: number;
  Disaster_ID: number;
}

interface QuantityRow extends RowDataPacket {
  Allocated_Quantity: number;
  Total_Distributed: number | string;
}

interface DistributionItem {
  resource_id: number;
  quantity_distributed: number;
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
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Distribution recording is disabled in production." },
      { status: 403 }
    );
  }

  // Admin and Coordinator can record distributions.
  const authorizationError = await requirePermission(
    "record_distribution"
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

  const allocationId = data.allocation_id;
  const beneficiaryId = data.beneficiary_id;

  if (
    !validId(allocationId) ||
    !validId(beneficiaryId)
  ) {
    return NextResponse.json(
      { error: "Enter valid allocation and beneficiary IDs." },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0 ||
    data.items.length > 20
  ) {
    return NextResponse.json(
      { error: "Enter between 1 and 20 distribution items." },
      { status: 400 }
    );
  }

  const items: DistributionItem[] = [];
  const seenResourceIds = new Set<number>();

  for (const rawItem of data.items) {
    if (
      !rawItem ||
      typeof rawItem !== "object" ||
      Array.isArray(rawItem)
    ) {
      return NextResponse.json(
        { error: "Invalid distribution item." },
        { status: 400 }
      );
    }

    const item = rawItem as Record<string, unknown>;

    if (
      !validId(item.resource_id) ||
      !validId(item.quantity_distributed)
    ) {
      return NextResponse.json(
        {
          error:
            "Resource IDs and distributed quantities must be positive integers.",
        },
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
      quantity_distributed: item.quantity_distributed,
    });
  }

  // Check resources in a consistent order.
  items.sort((a, b) => a.resource_id - b.resource_id);

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Lock the allocation to serialize distribution submissions.
    const [allocations] = await connection.query<AllocationRow[]>(
      `SELECT
         A.Allocation_ID,
         A.Allocation_Status,
         AR.Center_ID,
         AR.Disaster_ID
       FROM Allocation A
       JOIN Aid_Request AR
         ON A.Request_ID = AR.Request_ID
       WHERE A.Allocation_ID = ?
       FOR UPDATE`,
      [allocationId]
    );

    if (allocations.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Allocation not found." },
        { status: 404 }
      );
    }

    const allocation = allocations[0];

    if (
      allocation.Allocation_Status !== "Approved" &&
      allocation.Allocation_Status !== "Dispatched"
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          error:
            "Only approved or dispatched allocations can be distributed.",
        },
        { status: 409 }
      );
    }

    // Verify that the beneficiary belongs to the same
    // relief center and disaster as the allocation request.
    const [beneficiaries] =
      await connection.query<BeneficiaryRow[]>(
        `SELECT
           Beneficiary_ID,
           Center_ID,
           Disaster_ID
         FROM Beneficiary
         WHERE Beneficiary_ID = ?`,
        [beneficiaryId]
      );

    if (beneficiaries.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Beneficiary not found." },
        { status: 404 }
      );
    }

    const beneficiary = beneficiaries[0];

    if (
      beneficiary.Center_ID !== allocation.Center_ID ||
      beneficiary.Disaster_ID !== allocation.Disaster_ID
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          error:
            "Beneficiary does not belong to this allocation's relief center and disaster.",
        },
        { status: 400 }
      );
    }

    // Verify that the total distributed amount cannot
    // exceed the approved allocation.
    for (const item of items) {
      const [quantities] = await connection.query<QuantityRow[]>(
        `SELECT
           AI.Allocated_Quantity,
           COALESCE(
             (
               SELECT SUM(DI.Quantity_Distributed)
               FROM Distribution D
               JOIN Distribution_Item DI
                 ON D.Distribution_ID = DI.Distribution_ID
               WHERE D.Allocation_ID = AI.Allocation_ID
                 AND DI.Resource_ID = AI.Resource_ID
             ),
             0
           ) AS Total_Distributed
         FROM Allocation_Item AI
         WHERE AI.Allocation_ID = ?
           AND AI.Resource_ID = ?`,
        [allocationId, item.resource_id]
      );

      if (quantities.length === 0) {
        await connection.rollback();

        return NextResponse.json(
          {
            error:
              `Resource ${item.resource_id} is not part of this allocation.`,
          },
          { status: 400 }
        );
      }

      const allocated = Number(
        quantities[0].Allocated_Quantity
      );

      const alreadyDistributed = Number(
        quantities[0].Total_Distributed
      );

      const remaining = allocated - alreadyDistributed;

      if (item.quantity_distributed > remaining) {
        await connection.rollback();

        return NextResponse.json(
          {
            error:
              `Resource ${item.resource_id}: only ${remaining} units remain available for distribution.`,
          },
          { status: 409 }
        );
      }
    }

    // Create the distribution header.
    const [distributionResult] =
      await connection.execute<ResultSetHeader>(
        `INSERT INTO Distribution
           (Allocation_ID, Beneficiary_ID)
         VALUES (?, ?)`,
        [allocationId, beneficiaryId]
      );

    const distributionId = distributionResult.insertId;

    // Insert the distributed resource quantities.
    for (const item of items) {
      await connection.execute(
        `INSERT INTO Distribution_Item
           (
             Distribution_ID,
             Resource_ID,
             Quantity_Distributed
           )
         VALUES (?, ?, ?)`,
        [
          distributionId,
          item.resource_id,
          item.quantity_distributed,
        ]
      );
    }

    // Inventory is NOT deducted here:
    // it was already deducted during allocation.
    await connection.commit();

    return NextResponse.json(
      {
        message: "Distribution recorded successfully.",
        distribution_id: distributionId,
        allocation_id: allocationId,
        beneficiary_id: beneficiaryId,
        distributed_items: items,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Distribution rollback error:", rollbackError);
      }
    }

    console.error("Distribution recording error:", error);

    return NextResponse.json(
      { error: "Unable to record distribution." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
