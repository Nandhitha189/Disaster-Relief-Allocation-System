
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Resource = {
  Resource_ID: number;
  Resource_Name: string;
  Category: string;
  Unit: string;
  Available_Quantity: number;
  Minimum_Stock: number;
  Stock_Status: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/resources")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch resources");
        }
        return response.json();
      })
      .then(setResources)
      .catch(() => setError("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, []);

  const shortages = resources.filter(
    (resource) =>
      resource.Available_Quantity <= resource.Minimum_Stock
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Resource Inventory
        </h1>

        <p className="mt-2 text-slate-600">
          Monitor available relief supplies and stock shortages.
        </p>

        {loading && <p className="mt-8">Loading inventory...</p>}

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
                  Total Resource Types
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {resources.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Low / Out of Stock
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {shortages.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Available Resource Types
                </p>
                <p className="mt-2 text-3xl font-bold text-green-700">
                  {resources.length - shortages.length}
                </p>
              </div>
            </section>

            <section className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-4">Resource</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Minimum Stock</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {resources.map((resource) => (
                    <tr
                      key={resource.Resource_ID}
                      className="border-t border-slate-200"
                    >
                      <td className="p-4 font-medium">
                        {resource.Resource_Name}
                      </td>
                      <td className="p-4">{resource.Category}</td>
                      <td className="p-4">
                        {resource.Available_Quantity} {resource.Unit}
                      </td>
                      <td className="p-4">
                        {resource.Minimum_Stock}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            resource.Stock_Status === "Available"
                              ? "font-semibold text-green-700"
                              : "font-semibold text-red-600"
                          }
                        >
                          {resource.Stock_Status}
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
