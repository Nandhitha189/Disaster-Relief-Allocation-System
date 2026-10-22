
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RequestItem = {
  Request_ID: number;
  Center_Name: string;
  Disaster_Name: string;
  Priority: string;
  Status: string;
  Resource_Name: string;
  Quantity_Requested: number;
  Quantity_Allocated: number;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch requests");
        }
        return res.json();
      })
      .then((data: RequestItem[]) => setRequests(data))
      .catch(() => setError("Unable to load aid requests"))
      .finally(() => setLoading(false));
  }, []);

  const totalRequests = new Set(
    requests.map((item) => item.Request_ID)
  ).size;

  const partialRequests = new Set(
    requests
      .filter((item) => item.Status === "Partially Allocated")
      .map((item) => item.Request_ID)
  ).size;

  const shortages = requests.filter(
    (item) =>
      item.Quantity_Requested > item.Quantity_Allocated
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
        <Link
          href="/allocations"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
  View Allocations →
</Link>

        <h1 className="mt-6 text-3xl font-bold">
          Aid Requests Management
        </h1>

        <p className="mt-2 text-slate-600">
          Track relief requests, priorities, and allocated resources.
        </p>

        {loading && (
          <p className="mt-8">Loading aid requests...</p>
        )}

        {error && (
          <p role="alert" className="mt-8 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-3">

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Aid Requests
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {totalRequests}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Partially Allocated
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {partialRequests}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Resource Items with Shortages
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {shortages.length}
                </p>
              </div>

            </section>

            <section className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">

                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4">Disaster</th>
                    <th className="p-4">Relief Center</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Resource</th>
                    <th className="p-4">Requested</th>
                    <th className="p-4">Allocated</th>
                    <th className="p-4">Shortage</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((item) => (
                    <tr
                      key={`${item.Request_ID}-${item.Resource_Name}`}
                      className="border-t border-slate-200"
                    >
                      <td className="p-4">
                        {item.Disaster_Name}
                      </td>

                      <td className="p-4">
                        {item.Center_Name}
                      </td>

                      <td className="p-4 font-semibold">
                        {item.Priority}
                      </td>

                      <td className="p-4">
                        {item.Resource_Name}
                      </td>

                      <td className="p-4">
                        {item.Quantity_Requested}
                      </td>

                      <td className="p-4">
                        {item.Quantity_Allocated}
                      </td>

                      <td className="p-4">
                        {item.Quantity_Requested -
                          item.Quantity_Allocated}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            item.Status === "Partially Allocated"
                              ? "font-semibold text-orange-600"
                              : "font-semibold text-green-700"
                          }
                        >
                          {item.Status}
                        </span>
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
