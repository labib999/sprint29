import { createRouteHandlerSupabaseClient } from "@/services/supabase-route-handler";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * AI suggestion endpoint.
 *
 * Default provider is Gemini 2.0 Flash (free, 1,500 req/day, no credit card).
 * Set AI_PROVIDER=claude and CLAUDE_API_KEY to use Claude instead.
 *
 * Architectural decisions:
 * - Prompt template lives in a .txt file, NOT in React components
 *   (per DEVELOPMENT_GUIDE.md: "All prompts should live inside a
 *    dedicated prompts folder")
 * - This endpoint gracefully degrades — if the API key is missing or
 *   the call fails, it returns an empty suggestions array with an error
 * - The app continues functioning without AI
 */

const PROVIDER = (process.env.AI_PROVIDER ?? "gemini") as "gemini" | "claude";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Gemini API error:", res.status, text);
    throw new Error("AI provider error");
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("CLAUDE_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Claude API error:", res.status, text);
    throw new Error("AI provider error");
  }

  const data = await res.json();
  return data?.content?.[0]?.text ?? "";
}

function parseSuggestions(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { suggestions: [], error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { missions, weekId } = body;

    if (!missions || !weekId) {
      return NextResponse.json(
        { suggestions: [], error: "Missing missions or weekId" },
        { status: 400 }
      );
    }

    const apiKey =
      PROVIDER === "gemini"
        ? process.env.GEMINI_API_KEY
        : process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          suggestions: [],
          error:
            PROVIDER === "gemini"
              ? "Add GEMINI_API_KEY to use AI suggestions (free, no credit card)"
              : "Add CLAUDE_API_KEY to use AI suggestions",
        },
        { status: 200 }
      );
    }

    // Load and fill prompt template
    const promptPath = path.join(
      process.cwd(),
      "src",
      "features",
      "ai",
      "prompts",
      "weekly-prioritization.txt"
    );
    let prompt = fs.readFileSync(promptPath, "utf-8");
    prompt = prompt.replace("{{missions}}", JSON.stringify(missions, null, 2));

    const rawContent =
      PROVIDER === "gemini"
        ? await callGemini(prompt)
        : await callClaude(prompt);

    const suggestions = parseSuggestions(rawContent);

    if (!suggestions) {
      return NextResponse.json(
        { suggestions: [], error: "Failed to parse AI response" },
        { status: 200 }
      );
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json(
      { suggestions: [], error: "AI is currently unavailable" },
      { status: 200 }
    );
  }
}
