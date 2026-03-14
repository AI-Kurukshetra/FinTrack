create table if not exists category_budgets (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category varchar(80) not null,
  amount numeric(10,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, category)
);

alter table category_budgets enable row level security;

create policy "Users manage own category budgets"
  on category_budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_category_budgets_user on category_budgets(user_id);
