# BudgetBuddy — AWS / AI Upgrade Roadmap

Working checklist for moving off Vercel+Firebase to a self-deployed AWS stack,
and turning the AI chat into a real RAG pipeline. Goal is learning, not
resume-padding — keep each phase as simple as it can be while still being real.

## Decisions locked in
- Backend language: **Node/Express** (matches frontend, one less new thing to learn)
- Auth: **AWS Cognito** (replaces Firebase Auth, once everything else works)
- Compute: **EC2 t2.micro (free tier) + Docker Compose** — not ECS/Fargate, for
  the transferable fundamentals (SSH, security groups, Nginx, systemd)
- RAG approach: **tool-calling / text-to-SQL**, not vector-embedding RAG —
  the data is structured (transactions), so retrieval = scoped SQL query, not
  similarity search. (pgvector can be bolted on later for free-text notes if wanted.)

## Phases

- [x] **1. Postgres schema + migrate off Firestore (AWS RDS)**
  - [x] Design relational schema (users, categories, expenses, budgets, preferences, settings) — see `schema.sql`
  - [x] Create AWS RDS Postgres instance (free tier: db.t4g.micro, `budgetbuddy-db`, ca-central-1)
  - [x] Add security group inbound rule for local access (PostgreSQL/5432 from My IP)
  - [x] Run `schema.sql` against RDS — all 7 tables + index created
  - [ ] Narrow security group back down once the Express API (phase 2) is the only thing that needs DB access (currently public access is On, wide open beyond the IP rule — fine for now, revisit before real deployment)
  - [x] Write one-time export/import script — `scripts/migrate-to-postgres.js` (run via `npm run migrate:pg`)
  - [x] Get `serviceAccountKey.json` from Firebase Console and drop it in project root (gitignored)
  - [x] Run `npm run migrate:pg`, verify data parity — confirmed: 1 user, 3 categories, 4 expenses, 5 budget limits, all correct
  - [ ] Keep Firestore read-only as backup until confident (React app still reads/writes Firestore directly until Phase 2 replaces it)

- [x] **2. Express API** — CRUD endpoints replacing `src/services/*.js` Firestore calls
  - [x] Auth middleware (`server/middleware/auth.js`) — uses `firebase-admin`'s real `verifyIdToken`, not hand-rolled crypto like `api/ai.js`
  - [x] Port expense/category/budget/settings CRUD logic to SQL queries (`server/routes/*.js`)
  - [x] Verified end-to-end with a real Firebase ID token: all GETs return correct data, POST + DELETE work
  - [x] React app now calls this API instead of Firestore — rewrote all 4 `src/services/*.js` files behind the same exported function names/signatures, so hooks/components needed almost no changes
  - [x] Live-update behavior preserved via a small custom pub/sub (`src/services/pubsub.js`) that refetches + notifies subscribers after every mutation, replacing Firestore's `onSnapshot` — only syncs within one tab, not across tabs/devices (documented tradeoff)
  - [x] Category rename/delete cascade (reassign expenses to new name / "Other") moved server-side as real SQL transactions (`server/routes/categories.js`) — simpler than the old Firestore batch-write version
  - [x] Verified end-to-end in a real browser (Playwright, temporary admin-token sign-in, removed after): expenses/categories/goals all load correctly, live add + delete both work with no page refresh, totals/dates/amounts all correct
  - [x] Fixed two `pg` driver gotchas found during this verification: DATE columns were shifting by a timezone offset, NUMERIC columns were returned as strings and rendering as $0.00 in currency conversion — both fixed with type parsers in `server/db.js`

**Known pre-existing bug found (not caused by this migration, not yet fixed):** a React "duplicate key" warning on Dashboard/Goals — happens when a custom category shares a name with one of the 7 hardcoded defaults (e.g. this test user's custom "Entertainment" category). Root cause is the same duplicated default+custom category merge logic called out in the original architecture review (`Goals.jsx`, `DashboardOverview.jsx`, `ExpenseForm.jsx` each reimplement it slightly differently). Worth a small cleanup pass later — a single `useAllCategories()` hook.

- [x] **3. RAG via tool-calling**
  - [x] Defined 6 tools in `server/services/aiTools.js`: `get_spending_summary`, `get_monthly_totals`, `get_top_expenses`, `find_expenses`, `get_budget_status`, `list_categories` — each runs real SQL scoped to `WHERE user_id = req.uid`
  - [x] Moved the whole AI request off the client and into `server/routes/ai.js` (`POST /api/ai/chat`) — the old client-side `processMessage` computed every aggregate in JS and pasted the last 50 expenses + full category/budget lists into the prompt on every message; now the prompt (`server/services/aiPrompts.js`) carries only instructions, and Gemini calls a tool whenever it needs real numbers, an expense id, or a category id
  - [x] Real multi-turn function-calling loop (`server/routes/ai.js`, `runToolLoop`-style: model → functionCall → server runs SQL → functionResponse → model again, up to 5 turns) using `server/services/geminiClient.js`
  - [x] **Bonus correctness fix, not just a mechanism swap**: the old design could only find an expense/category to EDIT/DELETE if it was in the last-50-stuffed-into-prompt window — anything older was invisible to the model. Now `find_expenses`/`list_categories` query the whole table, so DELETE_EXPENSE/EDIT_EXPENSE/EDIT_CATEGORY/etc. can target any record regardless of age. Verified directly: asking to delete an expense returned its real DB id from a live SQL lookup, not a guess.
  - [x] Verified end-to-end against the real Gemini API and real RDS data (Playwright + direct curl): spending totals, category breakdowns, and budget-remaining answers all matched hand-computed values from the seeded rows; add-expense and delete-expense both worked through the real confirm-card UI with no console errors
  - [x] Found a real Gemini API quirk during testing: this API rejects `role: "function"` for tool results (the classic Gemini function-calling role name) — it wants the tool's response framed as the next `role: "user"` turn instead. Not documented anywhere obvious; found by hitting the actual 400 error.
  - [x] Added a 3-model fallback chain (`server/services/geminiClient.js`): `gemini-3.6-flash` (required primary, per `CLAUDE.md`) → `gemini-flash-latest` → `gemini-pro-latest`, each with its own retry/backoff (5s/15s/30s) on 429/503 before moving to the next model. Added after live testing showed the free-tier flash model returning "high demand" 503s fairly often; also surfaced that the free tier has **zero** quota for the pro model (`gemini-3.1-pro` under the hood) — so in practice the fallback chain currently only ever helps via `gemini-flash-latest`, but it's wired for whenever that changes.
  - [x] Moved AI rate limiting from a client-side `localStorage` counter (reset per-browser, not per-account) to a real DB-backed one — new `ai_usage` table + `server/services/aiUsage.js`, same atomic upsert pattern as the JIT user provisioning in Phase 2's auth middleware
  - [x] Retired `api/ai.js` (the old Vercel serverless Gemini proxy, hand-rolled Firebase JWT verification and all) and `src/setupProxy.js` (the CRA dev-server's local stand-in for it) — every Gemini call now goes through the real Express server with real Cognito auth, for both the chat tool-calling flow and the simpler `generateSummary` report-export blurb (`POST /api/ai/summary`)
  - [x] Simplified `useAIChat.js`: dropped the `subscribeToExpenses` subscription and the `dataReady` gate entirely — nothing client-side needs to pre-load expense data for the AI anymore, since retrieval happens server-side per question. Kept the `customCategories`/`budgets` subscriptions (still needed for UI rendering: the category dropdown on confirm cards, and the client-side budget migration when a category gets renamed via AI)

- [ ] **4. Evaluation harness**
  - [ ] 20–30 question/expected-answer pairs against seeded test data
  - [ ] Score: did it pick the right tool? was the final answer correct?
  - [ ] Re-run whenever the prompt/tools change, track accuracy over time

- [ ] **5. Dockerize**
  - [ ] Dockerfile for the Express API
  - [ ] `docker-compose.yml` (API + Postgres) for local dev

- [ ] **6. Deploy to AWS**
  - [ ] EC2 t2.micro, Docker Compose stack
  - [ ] Nginx reverse proxy, HTTPS via Let's Encrypt

- [x] **7. Swap Firebase Auth → AWS Cognito** — pulled forward out of order (user wanted Firebase gone entirely before continuing with RAG)
  - [x] Created Cognito User Pool (`User pool - bb`, `ca-central-1_1ijNng1NW`) + a public SPA app client (`2368k1nmrhsed3rf938qm6s4lr`, no secret — the first app client accidentally got created with a secret and had to be replaced)
  - [x] Password policy edited to drop the special-character requirement... then reversed — decided to keep Cognito's default and instead add the special-character check to `src/utils/validatePassword.js` so client-side validation matches what the server will actually accept
  - [x] `src/cognito.js` (User Pool config + `getIdToken()` helper) and full `AuthContext.js` rewrite using `amazon-cognito-identity-js` — kept the exact same exposed shape (`currentUser.uid/.email/.displayName`, async `.getIdToken()`) so every existing call site needed zero changes
  - [x] New `ConfirmSignUp.jsx` page + `/confirm-signup` route — Cognito requires confirming an emailed code before login, which Firebase's signup flow never needed
  - [x] `ForgotPassword.jsx`/`ResetPassword.jsx` reworked from a clickable-email-link flow (Firebase) to an email+code flow (Cognito) — actually simpler, no continue-URL/redirect-domain config needed anymore
  - [x] `server/middleware/auth.js` rewritten to verify Cognito tokens via `aws-jwt-verify` (the AWS-maintained equivalent of what `firebase-admin`'s `verifyIdToken` did)
  - [x] Removed `firebase`/`firebase-admin` from both `package.json`s, deleted `firebaseConfig.js` and `serviceAccountKey.json`, deleted the now-obsolete `scripts/migrate-to-postgres.js` and `scripts/get-test-token.js` (Firebase-specific one-off tools)
  - [x] Found and fixed a real gap during testing: nothing was creating a `users` Postgres row for new Cognito sign-ups (Firebase's migration script had done this one-time; Cognito needs its own path) — `server/middleware/auth.js` now upserts the `users` row on every authenticated request (just-in-time provisioning)
  - [x] Verified signup → email confirmation → login all work end-to-end in the real browser with a real account
  - [ ] Old Firebase-era Postgres test data (4 expenses, 3 categories, tied to the old Firebase UID) was deleted rather than remapped to the new Cognito ID — user decided it wasn't worth preserving
  - [x] Confirmed adding an expense works — new Cognito user auto-provisioned in `users` table, expense saved correctly (verified directly in Postgres)

## Test suite cleanup (Cognito migration)
- [x] All 10 test files that mocked Firebase (`Login.test.jsx`, `Signup.test.jsx`, `AuthFlow.test.jsx`, `Dashboard.test.jsx`, `Expenses.test.jsx`, `Categories.test.jsx`, `DashboardOverview.test.jsx`, `ExpenseForm.test.jsx`, `useAIChat.test.js`, `database.test.js`) rewritten to mock Cognito/the REST services instead — **all 305 tests across 26 suites pass**
- [x] New reusable manual mock: `src/__mocks__/amazon-cognito-identity-js.js` — uses real ES classes, not `jest.fn().mockImplementation()`, for the constructors (`CognitoUserPool`/`CognitoUser`) — the latter silently breaks under `new` due to a Babel/Jest interaction with ES `import` live bindings (verified empirically; documented in the mock file's comment)
- [x] Found and fixed real bugs along the way, not just mock plumbing: `DashboardOverview.test.jsx`'s fixture dates were hardcoded to August 2026 and had gone stale now that real time passed September 2026 — replaced with a `dateInCurrentMonth()` helper so they never go stale again
- [x] Established pattern for future test files: `jest.clearAllMocks()` does not reliably preserve a mock's baked-in default implementation across many tests in one file — re-establish defaults explicitly in `beforeEach`, don't rely on the manual mock's built-in defaults persisting

## Remaining known issues
(from the original architecture review, plus new ones found migrating off Firebase)
- Gemini's final JSON response is still parsed with a bare `JSON.parse` + regex extraction (`extractJson` in `server/routes/ai.js`), no schema validation — a malformed model response falls back to a generic CHAT message rather than crashing, but there's no structured validation of the intent-specific fields (e.g. `expenseData.amount` actually being a number). Worth adding if this becomes a real reliability issue.
- The free tier of the Gemini API has **zero** quota for the pro model — confirmed via a live "quota exceeded ... limit: 0, model: gemini-3.1-pro" response during Phase 3 testing — so the `gemini-pro-latest` link in the fallback chain is currently dead weight until the project moves off the free tier. Not removed, since it's harmless and free the moment that changes.
- Duplicated "merge default + custom categories" logic across `Goals.jsx`/`DashboardOverview.jsx`/`ExpenseForm.jsx` causes a real React duplicate-key warning when a custom category shares a name with a default one (found during Phase 2 testing) — worth a `useAllCategories()` hook cleanup

## Notes
- "Goals" has never been a real collection — it's just categories where
  `budgets.categories[name] > 0`. Decide during phase 1 schema design whether
  to keep that derived pattern or make goals first-class. Default: keep it
  derived, less to migrate.
