ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_user_policy" ON expenses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_user_policy" ON budgets
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);