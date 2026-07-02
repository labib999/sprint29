import { createRouteHandlerSupabaseClient } from "@/services/supabase-route-handler";
import { NextResponse } from "next/server";
import { buildWeeklyPrompt } from "@/features/ai/prompts/weekly-prioritization";
import Groq from "groq-sdk";

/**
 * AI suggestion endpoint.
 *
 * Uses Groq with llama-3.1-8b-instant (fast, generous free tier).
 * Requires GROQ_API_KEY env var.
 *
 * Architectural decisions:
 * - Prompt template is imported from src/features/ai/prompts/,
 *   NOT embedded in React components
 * - This endpoint gracefully degrades — if the API key is missing or
 *   the call fails, it returns an empty suggestions array with an error
 * - The app continues functioning without AI
 */

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.1-8b-instant",
  });
  return completion.choices[0]?.message?.content ?? "";
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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { suggestions: [], error: "Add GROQ_API_KEY to use AI suggestions" },
        { status: 200 }
      );
    }

    const prompt = buildWeeklyPrompt(missions);

    const rawContent = await callGroq(prompt);

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
