CREATE TABLE users (
  id            TEXT PRIMARY KEY,        -- Firebase uid for now, Cognito sub later
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE expenses (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  category_name TEXT NOT NULL,      -- kept as text: defaults aren't in `categories` today
  expense_date  DATE NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);

CREATE TABLE budgets (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  monthly     NUMERIC(12,2),         -- overall monthly limit, nullable
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE budget_category_limits (
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  monthly_limit NUMERIC(12,2) NOT NULL,
  PRIMARY KEY (user_id, category_name)
);
-- "Goals" = rows here with monthly_limit > 0 — same derived pattern as today, just relational.

CREATE TABLE preferences (
  user_id                    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  hidden_default_categories  TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE settings (
  user_id             TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  currency            TEXT NOT NULL DEFAULT 'USD',
  home_currency       TEXT NOT NULL DEFAULT 'USD',
  default_date_filter TEXT
);

-- Server-side daily AI request counter (replaces the old client-side
-- localStorage counter, which reset per-browser instead of per-account).
CREATE TABLE ai_usage (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date     DATE NOT NULL,
  request_count  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);
