
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type AllocationResult = {
  message: string;
  request_id: number;
  allocation_id: number;
  status: string;
  outstanding_items: number;
  allocated_items: {
    resource_id: number;
    allocated_now: number;
  }[];
};

export default function CreateAllocationPage() {
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AllocationResult | null>(null);

  async function handleAllocate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setResult(null);

    const id = Number(requestId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Please enter a valid request ID.");
      return;
    }

    const confirmed = window.confirm(
      `Allocate available inventory to Request #${id}? ` +
        "This will update your MySQL database."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/allocations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to allocate resources."
        );
      }

      setResult(data as AllocationResult);
      setRequestId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/allocations"
          className="font-medium text-blue-600 hover:underline"
        >
          ← Back to Allocations
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Allocate Relief Resources
        </h1>

        <p className="mt-2 text-slate-600">
          Allocate available resources to pending aid requests.
        </p>

        <form
          onSubmit={handleAllocate}
          className="mt-8 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            Resource Allocation Details
          </h2>

          <div className="mt-6">
            <label
              htmlFor="requestId"
              className="mb-2 block font-medium"
            >
              Aid Request ID
            </label>

            <input
              id="requestId"
              type="number"
              min="1"
              step="1"
              required
              value={requestId}
              onChange={(event) =>
                setRequestId(event.target.value)
              }
              placeholder="Example: 4"
              className="w-full rounded-lg border border-slate-300 p-3"
            />

            <p className="mt-2 text-sm text-slate-500">
              The system will allocate available stock for each
              outstanding resource item.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-red-700"
            >
              {error}
            </div>
          )}

          {result && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5"
            >
              <h3 className="text-lg font-semibold text-green-800">
                Allocation Successful
              </h3>

              <p className="mt-2">
                <strong>Request ID:</strong> {result.request_id}
              </p>

              <p>
                <strong>Allocation ID:</strong> {result.allocation_id}
              </p>

              <p>
                <strong>Request Status:</strong> {result.status}
              </p>

              <p>
                <strong>Outstanding Resource Types:</strong>{" "}
                {result.outstanding_items}
              </p>

              <h4 className="mt-4 font-semibold">
                Resources Allocated
              </h4>

              <ul className="mt-2 list-disc pl-5">
                {result.allocated_items.map((item) => (
                  <li key={item.resource_id}>
                    Resource #{item.resource_id}:{" "}
                    {item.allocated_now} units
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Allocating Resources..."
              : "Allocate Resources"}
          </button>
        </form>
      </div>
    </main>
  );
}
