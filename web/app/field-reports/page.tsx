
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FieldReport = {
  _id: string;
  disaster_id: number;
  center_id: number;
  location: string;
  severity: string;
  people_affected: number;
  urgent_needs: string[];
  report_status: string;
  reported_by: string;
};

export default function FieldReportsPage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/field-reports");

        if (!response.ok) {
          throw new Error("Failed to load field reports");
        }

        const data: FieldReport[] = await response.json();
        setReports(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error"
        );
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const totalAffected = reports.reduce(
    (total, report) => total + report.people_affected,
    0
  );

  const criticalReports = reports.filter(
    (report) => report.severity.toLowerCase() === "critical"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Disaster Field Reports
        </h1>

        <p className="mt-2 text-gray-600">
          Field observations retrieved from MongoDB Atlas.
        </p>

        {loading && <p className="mt-8">Loading field reports...</p>}

        {error && (
          <p className="mt-8 text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="my-8 grid gap-4 md:grid-cols-3">
              {[
                ["Total Reports", reports.length],
                ["Critical Reports", criticalReports],
                ["People Affected", totalAffected],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Location",
                      "Severity",
                      "People Affected",
                      "Urgent Needs",
                      "Status",
                      "Reported By",
                    ].map((heading) => (
                      <th key={heading} className="p-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">{report.location}</td>
                      <td className="p-4">
                        <span
                          className={
                            report.severity.toLowerCase() === "critical"
                              ? "font-semibold text-red-600"
                              : report.severity.toLowerCase() === "high"
                                ? "font-semibold text-orange-600"
                                : "font-semibold text-green-600"
                          }
                        >
                          {report.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        {report.people_affected}
                      </td>
                      <td className="p-4">
                        {report.urgent_needs.join(", ")}
                      </td>
                      <td className="p-4">
                        {report.report_status}
                      </td>
                      <td className="p-4">
                        {report.reported_by}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
