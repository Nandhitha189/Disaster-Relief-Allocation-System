
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Allocation = {
  Allocation_ID: number;
  Request_ID: number;
  Disaster_Name: string;
  Center_Name: string;
  Priority: string;
  Request_Status: string;
  Allocation_Status: string;
  Resource_Name: string;
  Allocated_Quantity: number;
  Unit: string;
};

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/allocations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load allocations");
        return res.json();
      })
      .then((data: Allocation[]) => setAllocations(data))
      .catch(() => setError("Unable to load allocations"))
      .finally(() => setLoading(false));
  }, []);

  const totalAllocations = new Set(
    allocations.map((a) => a.Allocation_ID)
  ).size;

  const partialAllocations = new Set(
    allocations
      .filter((a) => a.Request_Status === "Partially Allocated")
      .map((a) => a.Allocation_ID)
  ).size;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Allocation Tracking
        </h1>

        <p className="mt-2 text-slate-600">
          Monitor relief resource allocations by disaster priority.
        </p>

        {loading && <p className="mt-8">Loading allocations...</p>}

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
                  Partially Fulfilled Requests
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {partialAllocations}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Allocated Resource Entries
                </p>
                <p className="mt-2 text-3xl font-bold text-green-700">
                  {allocations.length}
                </p>
              </div>
            </section>

            <section className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4">Allocation ID</th>
                    <th className="p-4">Disaster</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Resource</th>
                    <th className="p-4">Allocated</th>
                    <th className="p-4">Allocation Status</th>
                    <th className="p-4">Request Status</th>
                  </tr>
                </thead>

                <tbody>
                  {allocations.map((item) => (
                    <tr
                      key={`${item.Allocation_ID}-${item.Resource_Name}`}
                      className="border-t border-slate-200"
                    >
                      <td className="p-4">{item.Allocation_ID}</td>
                      <td className="p-4">{item.Disaster_Name}</td>
                      <td className="p-4 font-semibold">{item.Priority}</td>
                      <td className="p-4">{item.Resource_Name}</td>
                      <td className="p-4">
                        {item.Allocated_Quantity} {item.Unit}
                      </td>
                      <td className="p-4 text-blue-700">
                        {item.Allocation_Status}
                      </td>
                      <td className={
                        item.Request_Status === "Partially Allocated"
                          ? "p-4 font-semibold text-orange-600"
                          : "p-4 font-semibold text-green-700"
                      }>
                        {item.Request_Status}
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
