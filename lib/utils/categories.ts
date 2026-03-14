/**
 * Expense categories with display metadata.
 */
export const CATEGORIES = [
  { name: "Food & Dining", icon: "utensils", color: "#f59e0b", tw: "amber" },
  { name: "Travel & Transport", icon: "car", color: "#3b82f6", tw: "blue" },
  { name: "Shopping", icon: "shopping-bag", color: "#ec4899", tw: "pink" },
  { name: "Bills & Utilities", icon: "receipt", color: "#8b5cf6", tw: "violet" },
  { name: "Entertainment", icon: "film", color: "#f97316", tw: "orange" },
  { name: "Health & Fitness", icon: "heart-pulse", color: "#ef4444", tw: "red" },
  { name: "Other", icon: "circle", color: "#6b7280", tw: "slate" },
] as const;

export type Category = (typeof CATEGORIES)[number]["name"];