
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SupplyUpdate = {
  _id: string;
  resource_id: number;
  resource_name: string;
  center_id: number;
  available_quantity: number;
  status: string;
  reported_by: string;
  remarks: string;
};

export default function SupplyUpdatesPage() {
  const [updates, setUpdates] = useState<SupplyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUpdates() {
      try {
        const response = await fetch("/api/supply-updates");

        if (!response.ok) {
          throw new Error("Unable to load supply updates");
        }

        const data: SupplyUpdate[] = await response.json();
        setUpdates(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unknown error"
        );
      } finally {
        setLoading(false);
      }
    }

    loadUpdates();
  }, []);

  const outOfStock = updates.filter(
    (item) => item.available_quantity === 0
  ).length;

  const lowStock = updates.filter(
    (item) =>
      item.available_quantity > 0 &&
      item.available_quantity < 100
  ).length;

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
          Disaster Relief Supply Updates
        </h1>

        <p className="mt-2 text-gray-600">
          Resource availability and field supply reports
          retrieved from MongoDB Atlas.
        </p>

        {loading && (
          <p className="mt-8">Loading supply updates...</p>
        )}

        {error && (
          <p className="mt-8 text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="my-8 grid gap-4 md:grid-cols-3">
              {[
                ["Total Supply Reports", updates.length],
                ["Out of Stock", outOfStock],
                ["Low Stock Reports", lowStock],
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
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Resource ID",
                      "Resource Name",
                      "Center ID",
                      "Available Quantity",
                      "Status",
                      "Reported By",
                      "Remarks",
                    ].map((heading) => (
                      <th key={heading} className="p-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {updates.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        {item.resource_id}
                      </td>
                      <td className="p-4 font-medium">
                        {item.resource_name}
                      </td>
                      <td className="p-4">
                        {item.center_id}
                      </td>
                      <td className="p-4">
                        {item.available_quantity}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            item.available_quantity === 0
                              ? "font-semibold text-red-600"
                              : "font-semibold text-green-600"
                          }
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.reported_by}
                      </td>
                      <td className="p-4">
                        {item.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {updates.length === 0 && (
                <p className="p-6 text-center text-gray-500">
                  No supply updates found.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
