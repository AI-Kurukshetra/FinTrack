import {
  Circle,
  Film,
  HeartPulse,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
  Car,
} from "lucide-react";

const categoryMap: Record<string, { icon: typeof Circle; className: string }> = {
  "Food & Dining": { icon: UtensilsCrossed, className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  "Travel & Transport": { icon: Car, className: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  Shopping: { icon: ShoppingBag, className: "bg-pink-500/15 text-pink-600 dark:text-pink-400" },
  "Bills & Utilities": { icon: Receipt, className: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  Entertainment: { icon: Film, className: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  "Health & Fitness": { icon: HeartPulse, className: "bg-red-500/15 text-red-600 dark:text-red-400" },
  Other: { icon: Circle, className: "bg-slate-500/15 text-slate-600 dark:text-slate-300" },
};

export function categoryIcon(category: string) {
  return categoryMap[category]?.icon ?? Circle;
}

export function categoryPillClass(category: string) {
  return categoryMap[category]?.className ?? "bg-slate-500/15 text-slate-600 dark:text-slate-300";
}