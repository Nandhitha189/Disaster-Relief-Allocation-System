
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type DistributionItem = {
  resource_id: string;
  quantity_distributed: string;
};

type DistributionResult = {
  distribution_id: number;
  allocation_id: number;
  beneficiary_id: number;
  distributed_items: {
    resource_id: number;
    quantity_distributed: number;
  }[];
};

function emptyItem(): DistributionItem {
  return {
    resource_id: "",
    quantity_distributed: "",
  };
}

export default function NewDistributionPage() {
  const [allocationId, setAllocationId] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [items, setItems] = useState<DistributionItem[]>([
    emptyItem(),
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DistributionResult | null>(null);

  function addItem() {
    if (items.length >= 20) {
      setError("Maximum 20 resources allowed.");
      return;
    }

    setItems((current) => [...current, emptyItem()]);
  }

  function updateItem(
    index: number,
    field: keyof DistributionItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, position) =>
        position === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeItem(index: number) {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter((_, position) => position !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setResult(null);

    const numbers = [
      Number(allocationId),
      Number(beneficiaryId),
      ...items.flatMap((item) => [
        Number(item.resource_id),
        Number(item.quantity_distributed),
      ]),
    ];

    if (
      numbers.some(
        (number) =>
          !Number.isSafeInteger(number) ||
          number <= 0 ||
          number > 2147483647
      )
    ) {
      setError("All IDs and quantities must be positive whole numbers.");
      return;
    }

    const resourceIds = items.map((item) =>
      Number(item.resource_id)
    );

    if (new Set(resourceIds).size !== resourceIds.length) {
      setError("Each resource may only appear once.");
      return;
    }

    const confirmed = window.confirm(
      "Record delivery of these resources to the selected beneficiary?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/distributions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allocation_id: Number(allocationId),
          beneficiary_id: Number(beneficiaryId),
          items: items.map((item) => ({
            resource_id: Number(item.resource_id),
            quantity_distributed: Number(
              item.quantity_distributed
            ),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to record distribution."
        );
      }

      setResult(data as DistributionResult);

      setAllocationId("");
      setBeneficiaryId("");
      setItems([emptyItem()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/distributions"
          className="font-medium text-blue-600 hover:underline"
        >
          ← Back to Distributions
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Record Aid Distribution
        </h1>

        <p className="mt-2 text-slate-600">
          Record relief supplies delivered to beneficiaries.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            Distribution Details
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="allocation"
                className="mb-2 block font-medium"
              >
                Allocation ID
              </label>

              <input
                id="allocation"
                type="number"
                min="1"
                step="1"
                required
                value={allocationId}
                onChange={(event) =>
                  setAllocationId(event.target.value)
                }
                placeholder="Example: 4"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="beneficiary"
                className="mb-2 block font-medium"
              >
                Beneficiary ID
              </label>

              <input
                id="beneficiary"
                type="number"
                min="1"
                step="1"
                required
                value={beneficiaryId}
                onChange={(event) =>
                  setBeneficiaryId(event.target.value)
                }
                placeholder="Example: 1"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-semibold">
              Distributed Resources
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the allocated resource IDs and quantities
              actually delivered.
            </p>

            {items.map((item, index) => (
              <div
                key={index}
                className="mt-4 grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Resource ID
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={item.resource_id}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "resource_id",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Quantity Distributed
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={item.quantity_distributed}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity_distributed",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 p-3"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="self-end rounded-lg bg-red-50 px-4 py-3 text-red-600 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              disabled={items.length >= 20}
              className="mt-5 rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 disabled:opacity-40"
            >
              + Add Another Resource
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-red-700"
            >
              {error}
            </p>
          )}

          {result && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-5"
            >
              <h3 className="text-lg font-semibold text-green-800">
                Distribution Recorded Successfully
              </h3>

              <p className="mt-2">
                <strong>Distribution ID:</strong>{" "}
                {result.distribution_id}
              </p>

              <p>
                <strong>Allocation ID:</strong>{" "}
                {result.allocation_id}
              </p>

              <p>
                <strong>Beneficiary ID:</strong>{" "}
                {result.beneficiary_id}
              </p>

              <h4 className="mt-4 font-semibold">
                Delivered Resources
              </h4>

              <ul className="mt-2 list-disc pl-5">
                {result.distributed_items.map((item) => (
                  <li key={item.resource_id}>
                    Resource #{item.resource_id}:{" "}
                    {item.quantity_distributed} units
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Recording Distribution..."
              : "Record Distribution"}
          </button>
        </form>
      </div>
    </main>
  );
}
