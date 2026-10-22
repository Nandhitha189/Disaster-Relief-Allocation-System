
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Severity = "Low" | "Medium" | "High" | "Critical";

type ReportStatus = "Open" | "In Progress" | "Resolved";

type ReportResponse = {
  message: string;
  report_id: string;
};

export default function NewFieldReportPage() {
  const [disasterId, setDisasterId] = useState("");
  const [centerId, setCenterId] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<Severity>("High");
  const [peopleAffected, setPeopleAffected] = useState("");
  const [urgentNeeds, setUrgentNeeds] = useState("");
  const [reportStatus, setReportStatus] =
    useState<ReportStatus>("Open");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReportResponse | null>(
    null
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setResult(null);

    const disaster = Number(disasterId);
    const center = Number(centerId);
    const affected = Number(peopleAffected);

    const needs = urgentNeeds
      .split(",")
      .map((need) => need.trim())
      .filter(Boolean);

    if (
      !Number.isSafeInteger(disaster) ||
      disaster <= 0 ||
      !Number.isSafeInteger(center) ||
      center <= 0
    ) {
      setError("Enter valid disaster and center IDs.");
      return;
    }

    if (
      peopleAffected.trim() === "" ||
      !Number.isSafeInteger(affected) ||
      affected < 0
    ) {
      setError("Enter a valid affected population.");
      return;
    }

    if (!location.trim() || needs.length === 0) {
      setError("Enter the location and urgent needs.");
      return;
    }

    if (needs.length > 20) {
      setError("Enter at most 20 urgent needs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/field-reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disaster_id: disaster,
          center_id: center,
          location: location.trim(),
          severity,
          people_affected: affected,
          urgent_needs: needs,
          report_status: reportStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit field report."
        );
      }

      setResult(data as ReportResponse);

      setDisasterId("");
      setCenterId("");
      setLocation("");
      setSeverity("High");
      setPeopleAffected("");
      setUrgentNeeds("");
      setReportStatus("Open");
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
          href="/field-reports"
          className="font-medium text-blue-600 hover:underline"
        >
          ← Back to Field Reports
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Submit Disaster Field Report
        </h1>

        <p className="mt-2 text-slate-600">
          Record field observations and urgent relief needs.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            Field Report Details
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="disasterId"
                className="mb-2 block font-medium"
              >
                Disaster ID
              </label>

              <input
                id="disasterId"
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

            <div>
              <label
                htmlFor="centerId"
                className="mb-2 block font-medium"
              >
                Relief Center ID
              </label>

              <input
                id="centerId"
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
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block font-medium"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              required
              minLength={3}
              maxLength={150}
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Example: Kerala Flood Relief Zone"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="severity"
                className="mb-2 block font-medium"
              >
                Severity
              </label>

              <select
                id="severity"
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value as Severity)
                }
                className="w-full rounded-lg border border-slate-300 p-3"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="peopleAffected"
                className="mb-2 block font-medium"
              >
                People Affected
              </label>

              <input
                id="peopleAffected"
                type="number"
                min="0"
                step="1"
                required
                value={peopleAffected}
                onChange={(event) =>
                  setPeopleAffected(event.target.value)
                }
                placeholder="Example: 150"
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="urgentNeeds"
              className="mb-2 block font-medium"
            >
              Urgent Needs
            </label>

            <textarea
              id="urgentNeeds"
              rows={3}
              required
              value={urgentNeeds}
              onChange={(event) =>
                setUrgentNeeds(event.target.value)
              }
              placeholder="Drinking Water, First Aid Kits, Blankets"
              className="w-full rounded-lg border border-slate-300 p-3"
            />

            <p className="mt-2 text-sm text-slate-500">
              Separate multiple needs using commas.
            </p>
          </div>

          <div>
            <label
              htmlFor="reportStatus"
              className="mb-2 block font-medium"
            >
              Report Status
            </label>

            <select
              id="reportStatus"
              value={reportStatus}
              onChange={(event) =>
                setReportStatus(
                  event.target.value as ReportStatus
                )
              }
              className="w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-red-700"
            >
              {error}
            </div>
          )}

          {result && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-5"
            >
              <h3 className="text-lg font-semibold text-green-800">
                Field Report Submitted Successfully
              </h3>

              <p className="mt-2">
                <strong>Report ID:</strong>{" "}
                {result.report_id}
              </p>

              <Link
                href="/field-reports"
                className="mt-4 inline-block font-semibold text-blue-600 hover:underline"
              >
                View Field Reports →
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Submitting Report..."
              : "Submit Field Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
