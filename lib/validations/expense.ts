import { z } from "zod";

/**
 * Zod schema for creating or updating an expense.
 */
export const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().max(255).optional().nullable(),
  date: z.string().min(10),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;