

import "server-only";

import { getMongoDatabase } from "@/lib/mongodb";

export type ActivityStatus = "Success" | "Partial";

export interface ActivityLogInput {
  action: string;
  request_id?: number | null;
  disaster_id?: number | null;
  performed_by: string;
  description: string;
  status: ActivityStatus;
}

export async function recordActivity(
  activity: ActivityLogInput
): Promise<boolean> {
  try {
    const database = await getMongoDatabase();

    await database.collection("activity_logs").insertOne({
      action: activity.action,
      request_id: activity.request_id ?? null,
      disaster_id: activity.disaster_id ?? null,
      performed_by: activity.performed_by,
      description: activity.description,
      status: activity.status,
      timestamp: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Activity logging failed:", error);

    // An operation already committed to MySQL or MongoDB
    // must not be reported as failed solely because logging failed.
    return false;
  }
}
