

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

interface DashboardStats {
  activeDisasters: number;
  reliefCenters: number;
  partialRequests: number;
  distributions: number;
}

const modules = [
  {
    title: "Disaster Management",
    description: "View disasters, locations, severity and status.",
    href: "/disasters",
    icon: "🌪️",
  },
  {
    title: "Resource Inventory",
    description: "Monitor relief supplies and stock shortages.",
    href: "/resources",
    icon: "📦",
  },
  {
    title: "Aid Requests",
    description: "Track requests, priorities and resource needs.",
    href: "/requests",
    icon: "📋",
  },
  {
    title: "Allocation Tracking",
    description: "View approved allocations and resource quantities.",
    href: "/allocations",
    icon: "🚚",
  },
  {
    title: "Distribution Tracking",
    description: "Monitor delivered and pending relief supplies.",
    href: "/distributions",
    icon: "🤝",
  },
  {
    title: "Field Reports",
    description: "View disaster field reports stored in MongoDB.",
    href: "/field-reports",
    icon: "📝",
  },
  {
    title: "Activity Logs",
    description: "Monitor operational activity and system events.",
    href: "/activity-logs",
    icon: "📊",
  },
  {
    title: "Supply Updates",
    description: "Track reported shortages and supply updates.",
    href: "/supply-updates",
    icon: "📢",
  },
];

const quickActions = [
  {
    title: "Create Aid Request",
    href: "/requests/new",
  },
  {
    title: "Allocate Resources",
    href: "/allocations/new",
  },
  {
    title: "Record Distribution",
    href: "/distributions/new",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeDisasters: 0,
    reliefCenters: 0,
    partialRequests: 0,
    distributions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load dashboard statistics.");
        }

        const data: DashboardStats = await response.json();

        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const statisticCards = [
    {
      title: "Active Disasters",
      value: stats.activeDisasters,
      color: "text-red-600",
    },
    {
      title: "Relief Centers",
      value: stats.reliefCenters,
      color: "text-blue-600",
    },
    {
      title: "Partial Requests",
      value: stats.partialRequests,
      color: "text-orange-600",
    },
    {
      title: "Distribution Records",
      value: stats.distributions,
      color: "text-green-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* Dashboard header */}
      <header className="bg-slate-900 px-6 py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Disaster Relief Management System
            </h1>

            <p className="mt-2 text-slate-300">
              Resource Allocation and Aid Distribution System
            </p>
          </div>

          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Dashboard overview */}
        <section>
          <h2 className="text-2xl font-bold">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-slate-600">
            Monitor disaster relief operations and resource
            distribution.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-4 text-red-700"
            >
              {error}
            </p>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statisticCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <p
                  className={`mt-4 text-3xl font-bold ${card.color}`}
                >
                  {loading ? "..." : card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <p className="mt-2 text-slate-600">
            Manage requests, allocations and distributions.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-lg bg-blue-600 px-5 py-4 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                {action.title} →
              </Link>
            ))}
          </div>
        </section>

        {/* Management modules */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            Management Modules
          </h2>

          <p className="mt-2 text-slate-600">
            Select a module to view disaster relief information.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="text-3xl">
                  {module.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {module.title}
                </h3>

                <p className="mt-3 min-h-12 text-sm text-slate-600">
                  {module.description}
                </p>

                <p className="mt-5 font-semibold text-blue-600 group-hover:underline">
                  Open Module →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          Disaster Relief Resource Allocation and Aid Distribution
          System
        </footer>
      </div>
    </main>
  );
}
