import { createRouteHandlerSupabaseClient } from "@/services/supabase-route-handler";
import { NextResponse } from "next/server";
import { buildWeeklyPrompt } from "@/features/ai/prompts/weekly-prioritization";
import Groq from "groq-sdk";
import type { Mission, Milestone } from "@/types";

/**
 * AI suggestion endpoint.
 *
 * Uses Groq with llama-3.1-8b-instant (fast, generous free tier).
 * Requires GROQ_API_KEY env var.
 *
 * Before generating suggestions, milestones with raw ai_context are
 * expanded via a quick Groq call into a structured paragraph covering:
 * current level/status, constraints, what's been tried, success criteria.
 * The expanded context is cached in the DB so it only runs once.
 *
 * Architectural decisions:
 * - Prompt template is imported from src/features/ai/prompts/,
 *   NOT embedded in React components
 * - Enhancement happens server-side so the API key stays private
 * - This endpoint gracefully degrades — if the API key is missing or
 *   the call fails, it returns an empty suggestions array with an error
 * - The app continues functioning without AI
 */

const ENHANCER_SYSTEM_PROMPT = `You are a goal planning assistant.
A user has provided rough context about their milestone.
Expand it into a structured paragraph covering: current level/status,
specific constraints, what has been tried, and what success looks like.
Be concise. Output only the expanded context, no preamble.`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: messages as Groq.Chat.Completions.ChatCompletionMessageParam[],
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

    // Enhance milestone contexts — parallelize to minimize latency.
    // For milestones with raw ai_context (not yet expanded), call Groq
    // once to expand into a structured paragraph, then cache in the DB.
    const enhancedMissions: Mission[] = await Promise.all(
      (missions as Mission[]).map(async (mission) => {
        if (!mission.milestones) return mission;

        const enhanced = await Promise.all(
          mission.milestones.map(async (m) => {
            if (!m.ai_context || m.ai_context_expanded) return m;

            try {
              const expanded = await callGroq([
                { role: "system", content: ENHANCER_SYSTEM_PROMPT },
                { role: "user", content: m.ai_context },
              ]);

              if (expanded) {
                await supabase
                  .from("milestones")
                  .update({
                    ai_context: expanded,
                    ai_context_expanded: true,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", m.id);

                return { ...m, ai_context: expanded, ai_context_expanded: true };
              }
            } catch {
              // Fall through — use raw context
            }
            return m;
          })
        );

        return { ...mission, milestones: enhanced };
      })
    );

    const prompt = buildWeeklyPrompt(enhancedMissions);

    const rawContent = await callGroq([{ role: "user", content: prompt }]);

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
