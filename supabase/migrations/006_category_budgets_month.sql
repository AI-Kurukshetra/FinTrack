ALTER TABLE category_budgets
  ADD COLUMN IF NOT EXISTS month_year varchar(7) NOT NULL DEFAULT to_char(current_date, 'YYYY-MM');

ALTER TABLE category_budgets
  DROP CONSTRAINT IF EXISTS category_budgets_amount_nonnegative;

ALTER TABLE category_budgets
  ADD CONSTRAINT category_budgets_amount_nonnegative CHECK (amount >= 0);

ALTER TABLE category_budgets
  DROP CONSTRAINT IF EXISTS category_budgets_user_id_category_key;

ALTER TABLE category_budgets
  DROP CONSTRAINT IF EXISTS category_budgets_user_category_month_key;

ALTER TABLE category_budgets
  ADD CONSTRAINT category_budgets_user_category_month_key UNIQUE (user_id, category, month_year);

CREATE INDEX IF NOT EXISTS idx_category_budgets_user_month
  ON category_budgets(user_id, month_year);
