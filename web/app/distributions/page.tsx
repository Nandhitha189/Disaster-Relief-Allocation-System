
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Distribution = {
  Allocation_ID: number;
  Disaster_Name: string;
  Resource_Name: string;
  Unit: string;
  Allocated_Quantity: number;
  Total_Distributed: number;
  Yet_To_Distribute: number;
};

export default function DistributionsPage() {
  const [records, setRecords] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/distributions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load distributions");
        return res.json();
      })
      .then((data: Distribution[]) => setRecords(data))
      .catch(() => setError("Unable to load distributions"))
      .finally(() => setLoading(false));
  }, []);

  const totalAllocations = new Set(
    records.map((r) => r.Allocation_ID)
  ).size;

  const deliveredItems = records.filter(
    (r) => r.Total_Distributed > 0
  ).length;

  const pendingItems = records.filter(
    (r) => r.Yet_To_Distribute > 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Distribution Tracking
        </h1>

        <p className="mt-2 text-slate-600">
          Monitor delivered supplies and pending distributions.
        </p>

        {loading && (
          <p className="mt-8">Loading distributions...</p>
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
                  Total Allocations
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {totalAllocations}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Resource Types with Deliveries
                </p>
                <p className="mt-2 text-3xl font-bold text-green-700">
                  {deliveredItems}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Entries Awaiting Distribution
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {pendingItems}
                </p>
              </div>
            </section>

            <section className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4">Allocation</th>
                    <th className="p-4">Disaster</th>
                    <th className="p-4">Resource</th>
                    <th className="p-4">Allocated</th>
                    <th className="p-4">Delivered</th>
                    <th className="p-4">Pending</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((item) => {
                    const status =
                      item.Yet_To_Distribute === 0
                        ? "Fully Distributed"
                        : item.Total_Distributed > 0
                        ? "Partially Distributed"
                        : "Pending Distribution";

                    return (
                      <tr
                        key={`${item.Allocation_ID}-${item.Resource_Name}`}
                        className="border-t border-slate-200"
                      >
                        <td className="p-4">
                          {item.Allocation_ID}
                        </td>

                        <td className="p-4">
                          {item.Disaster_Name}
                        </td>

                        <td className="p-4">
                          {item.Resource_Name}
                        </td>

                        <td className="p-4">
                          {item.Allocated_Quantity} {item.Unit}
                        </td>

                        <td className="p-4">
                          {item.Total_Distributed} {item.Unit}
                        </td>

                        <td className="p-4">
                          {item.Yet_To_Distribute} {item.Unit}
                        </td>

                        <td className="p-4">
                          <span
                            className={
                              status === "Fully Distributed"
                                ? "font-semibold text-green-700"
                                : status === "Partially Distributed"
                                ? "font-semibold text-blue-700"
                                : "font-semibold text-orange-600"
                            }
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
