"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InsightBadge } from "@/components/dashboard/InsightBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/formatters";
import { parseMonthYear } from "@/lib/utils/dateFilters";
import type { Insight } from "@/types";

type InsightSeverity = Insight["severity"];

type BudgetAlert = {
  category: string;
  spent: number;
  budget: number;
  over: number;
  pct: number;
};

const severityOrder: InsightSeverity[] = ["high", "medium", "low", "info"];
const severityLabels: Record<InsightSeverity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};
const severityBorders: Record<InsightSeverity, string> = {
  high: "border-l-red-500/70",
  medium: "border-l-amber-500/70",
  low: "border-l-emerald-500/70",
  info: "border-l-indigo-500/70",
};

type StreamStatus = "idle" | "streaming" | "done" | "error";

const formatTimestamp = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const { monthParam, label } = parseMonthYear({
    m: searchParams.get("m") ?? undefined,
    y: searchParams.get("y") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });

  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const streamRef = useRef<EventSource | null>(null);

  const startStream = useCallback(() => {
    streamRef.current?.close();
    setInsights([]);
    setError(null);
    setLastUpdated(null);
    setStatus("streaming");

    const stream = new EventSource("/api/insights");
    streamRef.current = stream;

    stream.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setStatus("done");
        setLastUpdated(new Date());
        stream.close();
        return;
      }

      try {
        const payload = JSON.parse(event.data) as Insight | { error?: string };
        if ("error" in payload && payload.error) {
          setError(payload.error);
          setStatus("error");
          stream.close();
          return;
        }
        setInsights((prev) => [...prev, payload as Insight]);
      } catch {
        // Ignore malformed messages to keep stream alive.
      }
    };

    stream.onerror = () => {
      setStatus("error");
      setError("Unable to stream insights right now.");
      stream.close();
    };
  }, []);

  useEffect(() => {
    startStream();
    return () => streamRef.current?.close();
  }, [startStream]);

  useEffect(() => {
    let active = true;

    const loadBudgetAlerts = async () => {
      setBudgetLoading(true);
      const response = await fetch(`/api/category-budgets?month_year=${monthParam}`);
      if (!active) return;
      if (response.ok) {
        const data = (await response.json()) as {
          budgets: Array<{ category: string; amount: number }>;
          spentByCategory: Record<string, number>;
        };
        const budgetMap = new Map<string, number>(
          (data.budgets ?? []).map((item) => [item.category, item.amount]),
        );
        const alerts = Array.from(budgetMap.entries())
          .map(([category, budget]) => {
            const spent = data.spentByCategory?.[category] ?? 0;
            const pct = budget > 0 ? spent / budget : 0;
            return {
              category,
              spent,
              budget,
              pct,
              over: Math.max(0, spent - budget),
            };
          })
          .filter((item) => item.budget > 0 && item.pct > 0.9)
          .sort((a, b) => b.pct - a.pct);
        setBudgetAlerts(alerts);
      } else {
        setBudgetAlerts([]);
      }
      setBudgetLoading(false);
    };

    loadBudgetAlerts();

    return () => {
      active = false;
    };
  }, [monthParam]);

  const counts = useMemo(
    () =>
      insights.reduce(
        (acc, insight) => {
          acc[insight.severity] += 1;
          return acc;
        },
        { high: 0, medium: 0, low: 0, info: 0 },
      ),
    [insights],
  );

  const isLoading = status === "streaming" && insights.length === 0;
  const statusCopy =
    status === "streaming"
      ? "Streaming insights from the last 90 days."
      : status === "done"
        ? "Latest insights ready to review."
        : "Ready to generate new insights.";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">AI Insights</h1>
          <p className="text-sm text-slate-600 dark:text-slate-500">
            Personalized signals, alerts, and savings opportunities.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={startStream} disabled={status === "streaming"}>
          <RefreshCw className={cn("h-4 w-4", status === "streaming" && "animate-spin-slow")} />
          Refresh
        </Button>
      </div>

      <div className="glass-card grad-border flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Engine Active</p>
            <p className="text-xs text-slate-600 dark:text-slate-500">{statusCopy}</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {lastUpdated ? `Last refreshed ${formatTimestamp(lastUpdated)}` : "Awaiting refresh"}
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          Budget Alerts ({label})
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {budgetLoading ? (
            <div className="text-xs text-slate-500 dark:text-slate-500">Loading alerts...</div>
          ) : budgetAlerts.length > 0 ? (
            budgetAlerts.map((alert) => (
              <div
                key={alert.category}
                className="glass-card border border-red-500/30 bg-red-500/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{alert.category}</p>
                  <span className="text-xs text-red-600 dark:text-red-200">
                    {Math.round(alert.pct * 100)}% used
                  </span>
                </div>
                <p className="mt-2 text-xs text-red-600 dark:text-red-200">
                  Spent {fmt(alert.spent)} / Budget {fmt(alert.budget)}
                </p>
                {alert.over > 0 ? (
                  <span className="mt-2 inline-flex rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-[11px] text-red-600 dark:text-red-200">
                    {fmt(alert.over)} Over Limit
                  </span>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-500">No red categories this month.</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {severityOrder.map((severity) => (
          <InsightBadge
            key={severity}
            label={`${severityLabels[severity]} ${counts[severity] ?? 0}`}
            variant={severity}
          />
        ))}
      </div>

      {error ? (
        <div className="glass-card border border-red-500/30 p-4 text-sm text-red-600 dark:text-red-200">
          {error} Try refreshing in a moment.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="glass-card p-5">
                <Skeleton className="h-4 w-28 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))
          : insights.map((insight, index) => (
              <div
                key={`${insight.title}-${index}`}
                className={cn(
                  "glass-card p-5 border-l-4 animate-fade-up",
                  severityBorders[insight.severity],
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <InsightBadge label={severityLabels[insight.severity]} variant={insight.severity} />
                    <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                      {insight.type}
                    </span>
                  </div>
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{insight.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{insight.description}</p>
              </div>
            ))}
      </div>

      {!isLoading && insights.length === 0 && !error ? (
        <div className="glass-card p-6 text-sm text-slate-600 dark:text-slate-500">
          No insights yet. Trigger a refresh to generate your first analysis.
        </div>
      ) : null}
    </div>
  );
}
