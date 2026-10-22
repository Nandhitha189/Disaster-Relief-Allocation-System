
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  activeDisasters: number;
  reliefCenters: number;
  partialRequests: number;
  distributions: number;
};

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Unable to load dashboard information.");
        }

        const data = await response.json();

        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    {
      title: "Active Disasters",
      value: dashboard?.activeDisasters,
      color: "text-red-600",
    },
    {
      title: "Relief Centers",
      value: dashboard?.reliefCenters,
      color: "text-blue-600",
    },
    {
      title: "Partial Requests",
      value: dashboard?.partialRequests,
      color: "text-orange-600",
    },
    {
      title: "Distribution Records",
      value: dashboard?.distributions,
      color: "text-green-600",
    },
  ];

  const mysqlModules = [
    {
      title: "Disaster Management",
      icon: "🌪️",
      description: "View disasters, locations, severity and status.",
      href: "/disasters",
    },
    {
      title: "Resource Inventory",
      icon: "📦",
      description: "Monitor relief supplies and stock shortages.",
      href: "/resources",
    },
    {
      title: "Aid Requests",
      icon: "📋",
      description: "Track requests, priorities and resource shortages.",
      href: "/requests",
    },
    {
      title: "Allocation Tracking",
      icon: "🚚",
      description: "View approved allocations and resource quantities.",
      href: "/allocations",
    },
    {
      title: "Distribution Tracking",
      icon: "🤝",
      description: "Monitor delivered and pending relief supplies.",
      href: "/distributions",
    },
  ];

  const mongoModules = [
    {
      title: "Field Reports",
      icon: "📍",
      description:
        "View disaster observations, urgent needs and affected populations.",
      href: "/field-reports",
      buttonText: "View Reports",
    },
    {
      title: "Activity Logs",
      icon: "📝",
      description:
        "Review resource allocation activities and operation history.",
      href: "/activity-logs",
      buttonText: "View Activities",
    },
    {
      title: "Supply Updates",
      icon: "🚨",
      description:
        "Monitor resource availability and emergency stock shortages.",
      href: "/supply-updates",
      buttonText: "View Supplies",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <h1 className="text-3xl font-bold">
            Disaster Relief Management System
          </h1>

          <p className="mt-2 text-slate-300">
            Resource Allocation and Aid Distribution System
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Dashboard Overview */}
        <section>
          <h2 className="text-2xl font-bold">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-slate-600">
            Monitor disaster relief operations and resource distribution.
          </p>

          {loading && (
            <p className="mt-4 text-slate-500">
              Loading dashboard information...
            </p>
          )}

          {error && (
            <p className="mt-4 text-red-600">
              {error}
            </p>
          )}

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p
                  className={`mt-3 text-3xl font-bold ${stat.color}`}
                >
                  {stat.value ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MySQL Management Modules */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            Management Modules
          </h2>

          <p className="mt-2 text-slate-600">
            Select a module to view disaster relief information.
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {mysqlModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="text-3xl">
                  {module.icon}
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {module.title}
                </h3>

                <p className="mt-3 text-sm text-slate-600">
                  {module.description}
                </p>

                <span className="mt-5 inline-block font-semibold text-blue-600">
                  Open Module →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* MongoDB Field Operations */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            MongoDB Field Operations
          </h2>

          <p className="mt-2 text-slate-600">
            View field reports, allocation activities and supply
            updates from MongoDB Atlas.
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {mongoModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="text-3xl">
                  {module.icon}
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {module.title}
                </h3>

                <p className="mt-3 text-sm text-slate-600">
                  {module.description}
                </p>

                <span className="mt-5 inline-block font-semibold text-blue-600">
                  {module.buttonText} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* About This System */}
        <section className="mt-12 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            About This System
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            The Disaster Relief Resource Allocation and Aid
            Distribution System helps organize disaster information,
            relief centers, resource inventories, aid requests,
            priority-based allocations, beneficiary distributions,
            field reports and emergency supply updates.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Technology Stack: Next.js, MySQL, MongoDB Atlas
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-7 text-center text-sm text-slate-500">
        DBMS Level 3 Project | Disaster Relief Management System
      </footer>
    </div>
  );
}
