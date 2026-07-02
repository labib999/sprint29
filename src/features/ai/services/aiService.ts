import type { AISuggestRequest, AISuggestResponse } from "@/types";

/**
 * AI service — communicates with the server-side API route.
 *
 * The AI logic runs server-side (Claude API call), but the prompt
 * template is stored client-side in src/features/ai/prompts/.
 * This keeps prompts editable without redeploying the API.
 */
export async function getAISuggestions(
  request: AISuggestRequest
): Promise<AISuggestResponse> {
  try {
    const res = await fetch("/api/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      return { suggestions: [], error: `AI server error (${res.status})` };
    }

    return await res.json();
  } catch {
    return { suggestions: [], error: "AI is currently unavailable" };
  }
}
