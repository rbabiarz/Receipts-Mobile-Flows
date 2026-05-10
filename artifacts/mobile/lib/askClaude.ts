import type { Answer } from "@/types";

// Set EXPO_PUBLIC_ANTHROPIC_API_KEY in your .env.local file
const API_KEY = (process.env as Record<string, string | undefined>)
  .EXPO_PUBLIC_ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are Receipts, a health research AI. Answer health questions with real evidence, graded like scientific literature.

Return ONLY valid JSON (no markdown fences, no explanation) matching this exact shape:
{
  "grade": "A" | "B" | "C" | "D",
  "gradeLabel": "Strong" | "Moderate" | "Suggestive" | "Hype watch",
  "headline": "1–2 sentence calibrated summary of the evidence",
  "summary": "3–5 sentences citing real studies (author, journal, year)",
  "takeaways": ["5 specific actionable bullet points"],
  "receipts": [
    {
      "id": "r1",
      "title": "Paper title",
      "cite": "First Author · Journal · Year · Study type · n=N",
      "url": "https://pubmed.ncbi.nlm.nih.gov/PMID/",
      "grade": "A" | "B" | "C" | "D",
      "studyType": "RCT" | "Meta-analysis" | "Observational" | "Animal" | "Review" | "Mechanistic",
      "tags": ["B · RCT"],
      "plainEnglish": "What the study found, plain language, 2–3 sentences",
      "qualityFlags": ["Pre-registered", "Large N"],
      "whyMatters": "Why this study matters for the question",
      "fundingFlag": "Funding source if potentially biasing"
    }
  ],
  "contradictions": 0,
  "sourceCount": 24,
  "duration": "12s"
}

Grading rules:
A = Multiple large RCTs with consistent results, meta-analyses agree
B = Some RCTs or strong meta-analysis with important caveats
C = Small trials, mixed results, mechanistic/observational only
D = Animal/in vitro data only, or contradicted in humans

Additional rules:
- Include 3 receipts minimum
- Use real PMIDs when confident; if uncertain, cite study details correctly but note in whyMatters
- Most supplements and biohacks are grade C or D — be calibrated, not promotional
- Flag industry funding when known
- sourceCount should be realistic (15–80)
- duration should be "8s"–"18s"`;

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
}

export async function askClaude(query: string): Promise<Partial<Answer> | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-allow-browser": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Health research question: ${query}` }],
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as AnthropicResponse;
    const text = data.content[0]?.text?.trim();
    if (!text) return null;

    // Strip accidental markdown fences Claude sometimes adds
    const clean = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(clean) as Partial<Answer>;
  } catch {
    return null;
  }
}
