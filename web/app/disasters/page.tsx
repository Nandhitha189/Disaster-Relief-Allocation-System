
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Disaster = {
  Disaster_ID: number;
  Disaster_Name: string;
  Disaster_Type: string;
  Location: string;
  Start_Date: string;
  Severity: string;
  Status: string;
};

export default function DisastersPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/disasters")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch disasters");
        }
        return response.json();
      })
      .then(setDisasters)
      .catch(() => setError("Unable to load disasters"))
      .finally(() => setLoading(false));
  }, []);

  const active = disasters.filter(
    (disaster) => disaster.Status === "Active"
  ).length;

  const critical = disasters.filter(
    (disaster) => disaster.Severity === "Critical"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Disaster Management
        </h1>

        <p className="mt-2 text-slate-600">
          Monitor recorded disasters, severity levels, and statuses.
        </p>

        {loading && <p className="mt-8">Loading disasters...</p>}

        {error && (
          <p role="alert" className="mt-6 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Disasters
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {disasters.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Active Disasters
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {active}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Critical Severity
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {critical}
                </p>
              </div>
            </section>

            <section className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4">Disaster</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {disasters.map((disaster) => (
                    <tr
                      key={disaster.Disaster_ID}
                      className="border-t border-slate-200"
                    >
                      <td className="p-4 font-medium">
                        {disaster.Disaster_Name}
                      </td>
                      <td className="p-4">
                        {disaster.Disaster_Type}
                      </td>
                      <td className="p-4">
                        {disaster.Location}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            disaster.Severity === "Critical"
                              ? "font-semibold text-red-600"
                              : "font-medium text-orange-600"
                          }
                        >
                          {disaster.Severity}
                        </span>
                      </td>
                      <td className="p-4">
                        {disaster.Status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
