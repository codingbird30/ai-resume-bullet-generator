import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[warn] ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

// Simple per-IP rate limiter so a local demo doesn't burn your API credit.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;
const hits = new Map();
app.use("/api/", (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = hits.get(ip) ?? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res
      .status(429)
      .json({ error: "Rate limit exceeded. Try again in a minute." });
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

const SYSTEM_PROMPT = `You are an expert resume writer who converts raw work descriptions into powerful, ATS-friendly resume bullet points.

Rules for every bullet:
- Start with a strong past-tense action verb (Led, Built, Shipped, Reduced, Architected, Automated, Negotiated, Drove, etc.). Never start two bullets with the same verb.
- Follow the STAR structure implicitly: action + context + quantified result.
- Include a concrete metric whenever the input supports it (%, $, #users, time saved, throughput). If the user gave no numbers, invent a plausible placeholder in [brackets] like "[X%]" so they can fill it in — never fabricate specific numbers as if they were real.
- Keep each bullet to a single line, ideally 15-25 words. No sub-bullets.
- No first-person pronouns ("I", "my"). No buzzword soup ("synergy", "leveraged cutting-edge"). No periods required at the end, but be consistent.
- Weave in the candidate's key skills naturally where they fit — do not list them verbatim.

Output format: return ONLY a JSON array of strings, no prose, no markdown fences. Example: ["Bullet one...", "Bullet two..."]`;

app.post("/api/generate", async (req, res) => {
  try {
    const { jobRole, yearsOfExperience, skills, workDescription, count = 5 } = req.body ?? {};

    if (!jobRole || !workDescription) {
      return res
        .status(400)
        .json({ error: "jobRole and workDescription are required." });
    }

    const n = Math.max(1, Math.min(10, Number(count) || 5));

    const userMessage = `Generate ${n} distinct resume bullet points for this candidate.

Role: ${jobRole}
Years of experience: ${yearsOfExperience || "not specified"}
Key skills: ${skills || "not specified"}

Work description / raw notes:
"""
${workDescription}
"""

Return ONLY the JSON array of ${n} bullets.`;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error:
          "Server is missing ANTHROPIC_API_KEY. Add it to your .env file and restart.",
      });
    }

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const bullets = parseBullets(text);
    if (!bullets.length) {
      return res
        .status(502)
        .json({ error: "Model did not return usable bullets.", raw: text });
    }

    res.json({ bullets, model: MODEL });
  } catch (err) {
    console.error("[/api/generate]", err);
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    res
      .status(status)
      .json({ error: err?.message || "Unknown server error." });
  }
});

// Serve the built client in production.
const clientDist = path.resolve(__dirname, "..", "dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) res.status(404).end();
  });
});

/** Parse the model response into an array of clean bullets. */
function parseBullets(text) {
  if (!text) return [];
  // Strip any accidental code fences.
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Try strict JSON first.
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((s) => s.trim()).filter(Boolean);
    }
  } catch {
    // fall through
  }

  // Try to locate the first JSON array substring.
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      // fall through
    }
  }

  // Last resort: split on newlines and strip leading "-", "*", or numbers.
  return cleaned
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 10);
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] model: ${MODEL}`);
});
