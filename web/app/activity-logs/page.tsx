
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ActivityLog = {
  _id: string;
  action: string;
  request_id?: number | null;
  disaster_id?: number | null;
  performed_by: string;
  description: string;
  status: string;
  timestamp?: string | null;
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/activity-logs", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load activity logs.");
        }

        const data: ActivityLog[] = await response.json();

        setLogs(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  const successful = logs.filter(
    (log) => log.status.toLowerCase() === "success"
  ).length;

  const partial = logs.filter(
    (log) => log.status.toLowerCase() === "partial"
  ).length;

  function formatTimestamp(value?: string | null) {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Disaster Relief Activity Logs
        </h1>

        <p className="mt-2 text-gray-600">
          Operational activities recorded in MongoDB Atlas.
        </p>

        {loading && (
          <p className="mt-8">Loading activity logs...</p>
        )}

        {error && (
          <p role="alert" className="mt-8 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="my-8 grid gap-4 md:grid-cols-3">
              {[
                ["Total Activities", logs.length],
                ["Successful Activities", successful],
                ["Partial Activities", partial],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-gray-500">
                    {label}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Action",
                      "Request ID",
                      "Disaster ID",
                      "Performed By",
                      "Description",
                      "Status",
                      "Timestamp",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="p-4 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {log.action}
                      </td>

                      <td className="p-4">
                        {log.request_id ?? "—"}
                      </td>

                      <td className="p-4">
                        {log.disaster_id ?? "—"}
                      </td>

                      <td className="p-4">
                        {log.performed_by}
                      </td>

                      <td className="p-4">
                        {log.description}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            log.status.toLowerCase() === "success"
                              ? "font-semibold text-green-600"
                              : "font-semibold text-orange-600"
                          }
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="p-4">
                        {formatTimestamp(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {logs.length === 0 && (
                <p className="p-6 text-center text-gray-500">
                  No activity logs found.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
