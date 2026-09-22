// gemini-3.6-flash is the required primary model (see CLAUDE.md). The two
// rolling aliases behind it are Google's own "always current-gen" pointers —
// used only as a fallback when the primary is overloaded/unavailable, never
// as a substitute for it, so this never quietly downgrades to an old pinned
// model version.
const MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const REQUEST_TIMEOUT_MS = 20000;
const PASSES = 2;
const DELAY_BETWEEN_PASSES_MS = 3000;

// Statuses worth moving on to the next model for, rather than failing the
// whole request outright.
const FALLBACK_STATUSES = new Set([429, 503, 404]);

async function requestModel(model, body, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body,
      signal: controller.signal,
    });
  } catch (err) {
    const e = new Error(err.name === 'AbortError' ? `${model} timed out` : err.message);
    e.status = 502;
    return { ok: false, err: e, canFallback: true };
  } finally {
    clearTimeout(timer);
  }

  if (res.ok) return { ok: true, data: await res.json() };

  const errBody = await res.json().catch(() => ({}));
  const err = new Error(errBody.error?.message || `Gemini API error ${res.status}`);
  err.status = res.status === 429 ? 429 : 502;
  return { ok: false, err, canFallback: FALLBACK_STATUSES.has(res.status) };
}

// Ground truth for what a call actually cost, straight from Gemini's own
// count — no more guessing from char-length. cachedContentTokenCount > 0
// means the implicit-caching prefix (CHAT_INSTRUCTIONS + tool declarations,
// see aiPrompts.js) actually got a cache hit on that call; 0 means it didn't
// (cold start, prefix mismatch, or below the model's cache-eligibility floor).
function logTokenUsage(model, usage) {
  if (!usage) return;
  const { promptTokenCount = 0, cachedContentTokenCount = 0, candidatesTokenCount = 0, totalTokenCount = 0 } = usage;
  const cachedPct = promptTokenCount > 0 ? Math.round((cachedContentTokenCount / promptTokenCount) * 100) : 0;
  console.log(
    `[gemini usage] model=${model} promptTokens=${promptTokenCount} cachedTokens=${cachedContentTokenCount} (${cachedPct}%) outputTokens=${candidatesTokenCount} totalTokens=${totalTokenCount}`
  );
}

// Calls Gemini's generateContent. `tools` is the raw functionDeclarations
// array from aiTools.js, or null/undefined for a plain text-only prompt.
//
// Retry strategy: cycle through all 3 models fast (no per-model backoff —
// retrying the SAME overloaded model with a long delay was the old design,
// but since this gets called up to 5x in one tool-calling request, that
// compounded into multi-minute hangs on a single slow request). If a full
// pass through every model fails, wait briefly once and do one more pass.
async function callGemini(contents, tools, { temperature = 0.2, maxOutputTokens = 1024, systemInstruction } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('AI service not configured');
    err.status = 500;
    throw err;
  }

  // Sent as its own top-level field, not folded into `contents` — a
  // structurally distinct, byte-identical-every-call field is what Gemini's
  // caching (implicit or explicit) actually keys off, not a sub-string
  // prefix buried inside one big text blob.
  const body = JSON.stringify({
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    contents,
    ...(tools ? { tools: [{ functionDeclarations: tools }] } : {}),
    generationConfig: { temperature, maxOutputTokens },
  });

  let lastErr;
  for (let pass = 0; pass < PASSES; pass++) {
    for (const model of MODELS) {
      const result = await requestModel(model, body, apiKey);
      if (result.ok) {
        logTokenUsage(model, result.data.usageMetadata);
        return result.data;
      }
      lastErr = result.err;
      if (!result.canFallback) throw lastErr;
    }
    if (pass < PASSES - 1) await sleep(DELAY_BETWEEN_PASSES_MS);
  }
  throw lastErr;
}

module.exports = { callGemini, MODELS };
