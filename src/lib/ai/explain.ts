import Anthropic from "@anthropic-ai/sdk";
import { ScoringResult, CategoryScore } from "../scoring/types";

const client = new Anthropic();

export async function generateExplanation(
  result: Omit<ScoringResult, "explanation">
): Promise<string> {
  const categoryBreakdown = result.categories
    .map((c: CategoryScore) => {
      const topSignals = c.signals
        .slice(0, 3)
        .map((s) => `  - [${s.severity}] ${s.label}: ${s.detail}`)
        .join("\n");
      return `${c.name} (${c.score}/100, weight ${c.weight * 100}%):\n${topSignals}`;
    })
    .join("\n\n");

  const prompt = `You're a chain analysis expert writing a privacy assessment for a crypto-native user. They just scanned Ethereum address ${result.address}${result.ensName ? ` (${result.ensName})` : ""}.

Composite privacy score: ${result.compositeScore}/100 (higher = more private)

Category breakdown:
${categoryBreakdown}

Write a 2-3 paragraph explanation of this address's privacy posture. Be direct and specific. Reference the actual findings. No preamble, no "here's your analysis" opener. Start with the verdict.

Rules:
- Crypto-native audience. Don't explain what bridges or DeFi are.
- Be specific about what makes this address linkable or private.
- If the score is low, say so plainly. If it's high, acknowledge it but note risks.
- No bullet points. Prose only.
- No em dashes. Use periods or commas.
- Under 150 words.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text || "Unable to generate explanation.";
}
