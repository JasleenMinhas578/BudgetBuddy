# BudgetBuddy – Claude Instructions

## AI / Gemini Model

- Always use `gemini-3.6-flash` as the primary Gemini model — never `gemini-2.0-flash` or any older version.
- The model list is defined in `server/services/geminiClient.js` as `MODELS` — `gemini-3.6-flash` must stay first. The two entries behind it (`gemini-flash-latest`, `gemini-pro-latest`) are Google's own rolling "always current-gen" aliases, used only as a fallback when the primary is overloaded — never replace them with a pinned older model version either.
- All Gemini calls now go through `server/` (see `server/routes/ai.js`, `Documents/AI_Chat_Feature.md`) — there is no client-side Gemini call or API key anymore.
