"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface BudgetModalProps {
  initialBudget: number;
}

/**
 * Budget edit modal with API upsert.
 */
export function BudgetModal({ initialBudget }: BudgetModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(initialBudget ?? 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(String(initialBudget ?? 0));
      setError(null);
    }
  }, [open, initialBudget]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ? JSON.stringify(payload.error) : "Failed to save budget");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Edit Budget
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Update Monthly Budget"
        description="Set your target spend for this month."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Budget (INR)</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2"
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}