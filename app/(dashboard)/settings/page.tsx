"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  History,
  Palette,
  Plus,
  SlidersHorizontal,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme, type ThemeName } from "@/lib/hooks/useTheme";
import { useColorMode } from "@/components/providers/ColorModeProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { fmt } from "@/lib/utils/formatters";
import { CATEGORIES } from "@/lib/utils/categories";
import type { CategoryBudget } from "@/types";
import {
  formatMonthLabel,
  getPreviousMonth,
  monthOptions,
  parseMonthYear,
} from "@/lib/utils/dateFilters";
import { HybridBudgetInput } from "@/components/ui/HybridBudgetInput";

interface StatusMessage {
  type: "success" | "error" | "info";
  message: string;
}

const themeOptions: Array<{
  id: ThemeName;
  label: string;
  description: string;
  previewClass: string;
}> = [
  {
    id: "emerald",
    label: "Emerald",
    description: "Balanced greens with a teal glow.",
    previewClass: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400",
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Cool blues and a calm backdrop.",
    previewClass: "bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400",
  },
  {
    id: "ember",
    label: "Ember",
    description: "Warm amber highlights with depth.",
    previewClass: "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400",
  },
];

const rangeConfig = {
  min: 0,
  max: 100000,
  step: 500,
};

type CategoryBudgetInput = {
  category: string;
  amount: number;
};

type HistoryMonth = {
  monthParam: string;
  label: string;
};

const buildCategoryBudgets = (data: CategoryBudget[]) => {
  const map = new Map<string, number>(data.map((item) => [item.category, item.amount]));
  return CATEGORIES.map((category) => ({
    category: category.name,
    amount: map.get(category.name) ?? 0,
  }));
};

const getStatusClass = (spent: number, budget: number) => {
  if (budget <= 0) {
    return spent > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400";
  }
  const pct = spent / budget;
  if (pct < 0.6) return "text-emerald-600 dark:text-emerald-400";
  if (pct <= 0.9) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { theme, setTheme, ready } = useTheme();
  const { theme: colorMode, setTheme: setColorMode } = useColorMode();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { month, year, monthParam } = parseMonthYear({
    m: searchParams.get("m") ?? undefined,
    y: searchParams.get("y") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });

  const now = new Date();
  const isCurrentWindow = now.getFullYear() === year && now.getMonth() + 1 === month;
  const isHistorical =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, index) => currentYear - index);
  }, []);

  const updateParams = (nextMonth: string, nextYear: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const monthLabel = monthOptions.find((option) => option.value === nextMonth)?.label ?? nextMonth;
    params.set("month", monthLabel);
    params.set("year", nextYear);
    params.delete("m");
    params.delete("y");
    router.push(`${pathname}?${params.toString()}`);
  };

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [budgetInput, setBudgetInput] = useState("0");
  const [budgetStatus, setBudgetStatus] = useState<StatusMessage | null>(null);
  const [budgetSaving, setBudgetSaving] = useState(false);

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetInput[]>(() =>
    buildCategoryBudgets([]),
  );
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});
  const [categoryStatus, setCategoryStatus] = useState<StatusMessage | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [historyMonths, setHistoryMonths] = useState<HistoryMonth[]>([]);
  const [historyBudgets, setHistoryBudgets] = useState<CategoryBudget[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportStatus, setExportStatus] = useState<StatusMessage | null>(null);

  const [dangerStatus, setDangerStatus] = useState<StatusMessage | null>(null);
  const [dangerBusy, setDangerBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error || !data.user) {
        setProfileStatus({ type: "error", message: "Unable to load profile." });
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      setName(
        (data.user.user_metadata?.name as string | undefined) ??
          data.user.email?.split("@")[0] ??
          "",
      );

      const response = await fetch("/api/budget");
      if (response.ok) {
        const budget = (await response.json()) as { amount?: number };
        setBudgetInput(String(Math.max(0, budget.amount ?? 0)));
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;

    const loadCategoryBudgets = async () => {
      setCategoryLoading(true);
      const response = await fetch(`/api/category-budgets?month_year=${monthParam}`);
      if (!active) return;
      if (response.ok) {
        const data = (await response.json()) as {
          budgets: CategoryBudget[];
          spentByCategory: Record<string, number>;
        };
        setCategoryBudgets(buildCategoryBudgets(data.budgets ?? []));
        setSpentByCategory(data.spentByCategory ?? {});
      } else {
        setCategoryBudgets(buildCategoryBudgets([]));
        setSpentByCategory({});
      }
      setCategoryLoading(false);
    };

    loadCategoryBudgets();

    return () => {
      active = false;
    };
  }, [monthParam]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setHistoryLoading(true);
      const response = await fetch(`/api/category-budgets/history?month_year=${monthParam}&months=4`);
      if (!active) return;
      if (response.ok) {
        const data = (await response.json()) as {
          months: HistoryMonth[];
          budgets: CategoryBudget[];
        };
        setHistoryMonths(data.months ?? []);
        setHistoryBudgets(data.budgets ?? []);
      } else {
        setHistoryMonths([]);
        setHistoryBudgets([]);
      }
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [monthParam]);

  const historyMap = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const item of historyBudgets) {
      if (!map.has(item.category)) {
        map.set(item.category, {});
      }
      const entry = map.get(item.category);
      if (entry) {
        entry[item.month_year] = item.amount;
      }
    }
    return map;
  }, [historyBudgets]);

  const currentHistory = historyMonths[0]?.monthParam ?? monthParam;
  const previousHistory = historyMonths[1]?.monthParam ?? getPreviousMonth(year, month).monthParam;
  const currentLabel = historyMonths[0]?.label ?? formatMonthLabel(year, month);
  const previousLabel = historyMonths[1]?.label ?? getPreviousMonth(year, month).label;

  const updateCategoryBudget = (category: string, value: number) => {
    if (isHistorical) return;
    const safeValue = Math.min(rangeConfig.max, Math.max(rangeConfig.min, value));
    setCategoryBudgets((prev) =>
      prev.map((item) => (item.category === category ? { ...item, amount: safeValue } : item)),
    );
  };

  const handleProfileSave = async () => {
    if (!name.trim()) {
      setProfileStatus({ type: "error", message: "Please enter a display name." });
      return;
    }
    setProfileSaving(true);
    setProfileStatus(null);

    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });

    if (error) {
      setProfileStatus({ type: "error", message: error.message });
    } else {
      setProfileStatus({ type: "success", message: "Profile updated." });
    }
    setProfileSaving(false);
  };

  const handleBudgetSave = async () => {
    const amount = Number(budgetInput);
    if (!Number.isFinite(amount) || amount < 0) {
      setBudgetStatus({ type: "error", message: "Enter a valid monthly budget." });
      return;
    }

    setBudgetSaving(true);
    setBudgetStatus(null);

    const response = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      setBudgetStatus({ type: "error", message: "Could not save budget." });
    } else {
      setBudgetStatus({ type: "success", message: `Budget saved at ${fmt(amount)}.` });
    }
    setBudgetSaving(false);
  };

  const handleCategorySave = async () => {
    if (isHistorical) {
      setCategoryStatus({ type: "info", message: "Historical budgets are read-only." });
      return;
    }
    setCategorySaving(true);
    setCategoryStatus(null);

    const response = await fetch("/api/category-budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month_year: monthParam, items: categoryBudgets }),
    });

    if (!response.ok) {
      setCategoryStatus({ type: "error", message: "Unable to save category budgets." });
      setCategorySaving(false);
      return;
    }

    setCategoryStatus({ type: "success", message: "Category budgets saved." });
    setCategorySaving(false);
  };

  const handleCopyFromLastMonth = async () => {
    if (!isCurrentWindow) return;
    const prev = getPreviousMonth(year, month);
    setCategoryStatus(null);
    const response = await fetch(`/api/category-budgets?month_year=${prev.monthParam}`);
    if (!response.ok) {
      setCategoryStatus({ type: "error", message: "Unable to copy from last month." });
      return;
    }
    const data = (await response.json()) as { budgets: CategoryBudget[] };
    setCategoryBudgets(buildCategoryBudgets(data.budgets ?? []));
    setCategoryStatus({ type: "info", message: `Copied ${prev.label} allocations.` });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (exportFrom) params.set("from", exportFrom);
    if (exportTo) params.set("to", exportTo);
    const query = params.toString();
    setExportStatus({ type: "info", message: "Preparing CSV download." });
    window.location.href = `/api/export${query ? `?${query}` : ""}`;
  };

  const handleDeleteExpenses = async () => {
    if (!userId || dangerBusy) return;
    const confirmed = window.confirm("Delete all expenses? This cannot be undone.");
    if (!confirmed) return;

    setDangerBusy(true);
    setDangerStatus(null);

    const { error } = await supabase.from("expenses").delete().eq("user_id", userId);

    if (error) {
      setDangerStatus({ type: "error", message: error.message });
    } else {
      setDangerStatus({ type: "success", message: "All expenses deleted." });
    }
    setDangerBusy(false);
  };

  const handleDeleteAccount = async () => {
    if (dangerBusy) return;
    const confirmed = window.confirm(
      "Delete your account and all data? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDangerBusy(true);
    setDangerStatus(null);

    const response = await fetch("/api/account", { method: "DELETE" });

    if (!response.ok) {
      setDangerStatus({ type: "error", message: "Account deletion failed." });
      setDangerBusy(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-500">Control your profile, theme, and exports.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-5">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <User className="h-4 w-4 text-emerald-400" />
            Profile
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-500">Display name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-500">Email</label>
              <Input value={email} readOnly className="opacity-70" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {profileStatus ? <Toast variant={profileStatus.type}>{profileStatus.message}</Toast> : null}
            <Button size="sm" onClick={handleProfileSave} disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </section>

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Wallet className="h-4 w-4 text-emerald-400" />
            Monthly budget
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-500">Budget amount (INR)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-500">
              {Number.isFinite(Number(budgetInput)) ? `Preview: ${fmt(Number(budgetInput))}` : ""}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {budgetStatus ? <Toast variant={budgetStatus.type}>{budgetStatus.message}</Toast> : null}
            <Button size="sm" onClick={handleBudgetSave} disabled={budgetSaving}>
              {budgetSaving ? "Saving..." : "Save budget"}
            </Button>
          </div>
        </section>
      </div>

      <section className="glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            Finance Manager
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isHistorical ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                Viewing historical data
              </span>
            ) : null}
            <select
              className="fin-input h-9 px-3 py-0 text-xs text-slate-900 dark:text-white"
              value={String(month).padStart(2, "0")}
              onChange={(event) => updateParams(event.target.value, String(year))}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white dark:bg-ink-900">
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="fin-input h-9 px-3 py-0 text-xs text-slate-900 dark:text-white"
              value={String(year)}
              onChange={(event) => updateParams(String(month).padStart(2, "0"), event.target.value)}
            >
              {years.map((option) => (
                <option key={option} value={option} className="bg-white dark:bg-ink-900">
                  {option}
                </option>
              ))}
            </select>
            {isCurrentWindow ? (
              <Button variant="ghost" size="sm" onClick={handleCopyFromLastMonth}>
                Copy last month
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-500">
          Manage category allocations for {formatMonthLabel(year, month)}.
        </p>

        <div className="mt-4 space-y-4">
          {categoryBudgets.map((item) => {
            const spent = spentByCategory[item.category] ?? 0;
            const statusClass = getStatusClass(spent, item.amount);
            const over = Math.max(0, spent - item.amount);
            return (
              <div key={item.category} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03] p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.category}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-500">Monthly allocation</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      New allocation
                    </div>
                  </div>

                  <HybridBudgetInput
                    layout="split"
                    value={item.amount}
                    min={rangeConfig.min}
                    max={rangeConfig.max}
                    step={rangeConfig.step}
                    onChange={(value) => updateCategoryBudget(item.category, value)}
                    disabled={isHistorical}
                    statusSlot={
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={cn("text-xs", statusClass)}>
                          Spent: {fmt(spent)} / Budget: {fmt(item.amount)}
                        </span>
                        {over > 0 ? (
                          <span className="glass-card border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-600 dark:text-red-200">
                            {fmt(over)} Over Limit
                          </span>
                        ) : null}
                      </div>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {categoryStatus ? <Toast variant={categoryStatus.type}>{categoryStatus.message}</Toast> : null}
          {isHistorical ? (
            <span className="text-xs text-slate-600 dark:text-slate-500">Editing disabled for past months.</span>
          ) : (
            <Button size="sm" onClick={handleCategorySave} disabled={categorySaving || categoryLoading}>
              {categorySaving ? "Saving..." : categoryLoading ? "Loading..." : "Save category budgets"}
            </Button>
          )}
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <History className="h-4 w-4 text-emerald-400" />
          Budget History
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-500">
          Month-over-month changes for {currentLabel}.
        </p>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-500 md:grid-cols-4">
            <span>Category</span>
            <span>{currentLabel}</span>
            <span>{previousLabel}</span>
            <span>Change</span>
          </div>
          {historyLoading ? (
            <div className="glass-card p-4 text-xs text-slate-600 dark:text-slate-500">Loading history...</div>
          ) : (
            CATEGORIES.map((category) => {
              const current = historyMap.get(category.name)?.[currentHistory] ?? 0;
              const previous = historyMap.get(category.name)?.[previousHistory] ?? 0;
              const delta = current - previous;
              const deltaClass = delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
              return (
                <div
                  key={category.name}
                  className="grid grid-cols-1 items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-white/5 dark:bg-white/[0.02] px-3 py-2 text-xs md:grid-cols-4"
                >
                  <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                  <span className="text-slate-900 dark:text-white">{fmt(current)}</span>
                  <span className="text-slate-600 dark:text-slate-400">{fmt(previous)}</span>
                  <span className={cn("font-semibold", deltaClass)}>{fmt(delta)}</span>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Palette className="h-4 w-4 text-emerald-400" />
          Appearance
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-500">
          Pick a glassmorphism accent set for your workspace.
        </p>

        <div className="mt-4 mb-5">
          <p className="mb-2 text-xs text-slate-600 dark:text-slate-500">Color mode</p>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
            {(["light", "system", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setColorMode(mode)}
                className={cn(
                  "min-w-18 rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition-all duration-200",
                  colorMode === mode
                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {themeOptions.map((option) => {
            const selected = ready && theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={selected}
                className={cn(
                  "glass-card-hover p-4 text-left border",
                  selected ? "border-emerald-500/40" : "border-slate-200 dark:border-white/10",
                )}
              >
                <div className={cn("h-8 rounded-lg", option.previewClass)} />
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{option.label}</p>
                <p className="text-xs text-slate-600 dark:text-slate-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Download className="h-4 w-4 text-emerald-400" />
          Export data
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-500">
          Download a CSV file of your expenses for offline analysis.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-500">From</label>
            <Input type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-500">To</label>
            <Input type="date" value={exportTo} onChange={(event) => setExportTo(event.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {exportStatus ? <Toast variant={exportStatus.type}>{exportStatus.message}</Toast> : null}
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </section>

      <section className="glass-card border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-200">
          <AlertTriangle className="h-4 w-4" />
          Danger zone
        </div>
        <p className="mt-2 text-xs text-red-600 dark:text-red-200/70">
          These actions are permanent. Make sure you have exported any data you need.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-red-500/20 bg-white dark:bg-black/20 p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Delete all expenses</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">This clears every transaction row.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 border border-red-500/30 text-red-600 dark:text-red-200 hover:bg-red-500/10"
              onClick={handleDeleteExpenses}
              disabled={dangerBusy}
            >
              <Trash2 className="h-4 w-4" />
              Delete expenses
            </Button>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-white dark:bg-black/20 p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Delete account</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Removes your profile and all data.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 border border-red-500/30 text-red-600 dark:text-red-200 hover:bg-red-500/10"
              onClick={handleDeleteAccount}
              disabled={dangerBusy}
            >
              <CheckCircle2 className="h-4 w-4" />
              Delete account
            </Button>
          </div>
        </div>
        {dangerStatus ? (
          <div className="mt-4">
            <Toast variant={dangerStatus.type}>{dangerStatus.message}</Toast>
          </div>
        ) : null}
      </section>
    </div>
  );
}
