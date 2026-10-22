
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type ResourceItem = {
  resource_id: string;
  quantity_requested: string;
};

function emptyItem(): ResourceItem {
  return {
    resource_id: "",
    quantity_requested: "",
  };
}

export default function NewAidRequestPage() {
  const [centerId, setCenterId] = useState("");
  const [disasterId, setDisasterId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [items, setItems] = useState<ResourceItem[]>([
    emptyItem(),
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function addItem() {
    if (items.length >= 20) {
      setError("Maximum 20 resources allowed.");
      return;
    }

    setItems((current) => [...current, emptyItem()]);
    setError("");
  }

  function updateItem(
    index: number,
    field: keyof ResourceItem,
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
    if (items.length <= 1) return;

    setItems((current) =>
      current.filter((_, position) => position !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const numbers = [
      Number(centerId),
      Number(disasterId),
      ...items.flatMap((item) => [
        Number(item.resource_id),
        Number(item.quantity_requested),
      ]),
    ];

    const invalidNumber = numbers.some(
      (number) =>
        !Number.isSafeInteger(number) ||
        number <= 0 ||
        number > 2147483647
    );

    if (invalidNumber) {
      setError("All IDs and quantities must be positive whole numbers.");
      return;
    }

    const ids = items.map((item) => Number(item.resource_id));

    if (new Set(ids).size !== ids.length) {
      setError("Please enter each resource only once.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_id: Number(centerId),
          disaster_id: Number(disasterId),
          priority,
          items: items.map((item) => ({
            resource_id: Number(item.resource_id),
            quantity_requested: Number(item.quantity_requested),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create aid request."
        );
      }

      setSuccess(
        `Aid Request #${result.request_id} created successfully! ` +
        `Status: ${result.status}. ` +
        `Items: ${result.items_created}.`
      );

      setCenterId("");
      setDisasterId("");
      setPriority("Medium");
      setItems([emptyItem()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/requests"
          className="font-medium text-blue-600 hover:underline"
        >
          ← Back to Aid Requests
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Create New Aid Request
        </h1>

        <p className="mt-2 text-slate-600">
          Submit resource requirements for a disaster relief center.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            Request Details
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="center"
                className="mb-2 block font-medium"
              >
                Relief Center ID
              </label>

              <input
                id="center"
                type="number"
                min="1"
                step="1"
                required
                value={centerId}
                onChange={(event) =>
                  setCenterId(event.target.value)
                }
                placeholder="Example: 1"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="disaster"
                className="mb-2 block font-medium"
              >
                Disaster ID
              </label>

              <input
                id="disaster"
                type="number"
                min="1"
                step="1"
                required
                value={disasterId}
                onChange={(event) =>
                  setDisasterId(event.target.value)
                }
                placeholder="Example: 1"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-2 block font-medium"
            >
              Priority
            </label>

            <select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-xl font-semibold">
              Requested Resources
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the resource IDs and required quantities.
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
                    Quantity Requested
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={item.quantity_requested}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity_requested",
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
            <p role="alert" className="text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="font-medium text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? "Submitting Request..."
              : "Submit Aid Request"}
          </button>
        </form>
      </div>
    </main>
  );
}
