
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

import pool from "@/lib/mysql";
import { getMongoDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import { recordActivity } from "@/lib/activity-log";

interface CenterRow extends RowDataPacket {
  Center_ID: number;
  Disaster_ID: number;
}

const validSeverities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const validStatuses = [
  "Open",
  "In Progress",
  "Resolved",
];

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
      { error: "Field report submission is disabled in production." },
      { status: 403 }
    );
  }

  // Admin and Coordinator can submit field reports.
  const authorizationError = await requirePermission(
    "create_request"
  );

  if (authorizationError) {
    return authorizationError;
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please sign in." },
      { status: 401 }
    );
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
      { error: "Invalid report data." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  const disasterId = data.disaster_id;
  const centerId = data.center_id;
  const location = data.location;
  const severity = data.severity;
  const peopleAffected = data.people_affected;
  const urgentNeeds = data.urgent_needs;
  const reportStatus = data.report_status;

  if (!validId(disasterId) || !validId(centerId)) {
    return NextResponse.json(
      { error: "Enter valid disaster and center IDs." },
      { status: 400 }
    );
  }

  if (
    typeof location !== "string" ||
    location.trim().length < 3 ||
    location.trim().length > 150
  ) {
    return NextResponse.json(
      { error: "Location must be 3 to 150 characters." },
      { status: 400 }
    );
  }

  if (
    typeof severity !== "string" ||
    !validSeverities.includes(severity)
  ) {
    return NextResponse.json(
      { error: "Invalid severity." },
      { status: 400 }
    );
  }

  if (
    typeof peopleAffected !== "number" ||
    !Number.isSafeInteger(peopleAffected) ||
    peopleAffected < 0 ||
    peopleAffected > 2147483647
  ) {
    return NextResponse.json(
      { error: "Enter a valid affected population." },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(urgentNeeds) ||
    urgentNeeds.length < 1 ||
    urgentNeeds.length > 20 ||
    !urgentNeeds.every(
      (need) =>
        typeof need === "string" &&
        need.trim().length >= 2 &&
        need.trim().length <= 100
    )
  ) {
    return NextResponse.json(
      { error: "Enter between 1 and 20 valid urgent needs." },
      { status: 400 }
    );
  }

  if (
    typeof reportStatus !== "string" ||
    !validStatuses.includes(reportStatus)
  ) {
    return NextResponse.json(
      { error: "Invalid report status." },
      { status: 400 }
    );
  }

  const cleanedNeeds = [
    ...new Set(
      (urgentNeeds as string[]).map((need) => need.trim())
    ),
  ];

  try {
    // Relief_Center does not contain Disaster_ID.
    // This uses existing aid requests to establish a
    // previously recorded center/disaster association.
    const [centers] = await pool.execute<CenterRow[]>(
      `SELECT
         RC.Center_ID,
         AR.Disaster_ID
       FROM Relief_Center RC
       JOIN Aid_Request AR
         ON AR.Center_ID = RC.Center_ID
       WHERE RC.Center_ID = ?
         AND AR.Disaster_ID = ?
       LIMIT 1`,
      [centerId, disasterId]
    );

    if (centers.length === 0) {
      return NextResponse.json(
        {
          error:
            "No matching relief center and disaster relationship found.",
        },
        { status: 400 }
      );
    }

    const database = await getMongoDatabase();

    const fieldReport = {
      disaster_id: disasterId,
      center_id: centerId,
      location: location.trim(),
      severity,
      people_affected: peopleAffected,
      urgent_needs: cleanedNeeds,
      report_status: reportStatus,
      reported_by: session.username,
      created_at: new Date(),
    };

    const result = await database
      .collection("field_reports")
      .insertOne(fieldReport);

    const logged = await recordActivity({
      action: "FIELD_REPORT_SUBMITTED",
      disaster_id: disasterId,
      performed_by: session.username,
      description:
        `Field report ${result.insertedId.toString()} ` +
        `submitted for ${location.trim()}, Center #${centerId}. ` +
        `Severity: ${severity}.`,
      status: "Success",
    });

    return NextResponse.json(
      {
        message: "Field report submitted successfully.",
        report_id: result.insertedId.toString(),
        report: {
          ...fieldReport,
          created_at: fieldReport.created_at.toISOString(),
        },
        activity_logged: logged,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Field report creation error:", error);

    return NextResponse.json(
      { error: "Unable to submit field report." },
      { status: 500 }
    );
  }
}
