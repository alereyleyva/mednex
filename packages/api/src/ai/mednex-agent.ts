import { Agent } from "@mastra/core/agent";
import { env } from "@mednex/env/server";

let mednexAgent: Agent | null = null;

export function getMednexAgent() {
  if (!env.OPENROUTER_API_KEY) {
    return null;
  }

  if (mednexAgent) {
    return mednexAgent;
  }

  const model = env.OPENROUTER_MODEL.startsWith("openrouter/")
    ? env.OPENROUTER_MODEL
    : `openrouter/${env.OPENROUTER_MODEL}`;

  mednexAgent = new Agent({
    id: "mednex-clinical-assistant",
    name: "Mednex Clinical Assistant",
    instructions: `You are Mednex, an AI clinical assistant for doctors and nurses.

Core behavior:
- Provide concise, practical, and safety-focused clinical support.
- Use structured responses when useful (assessment, red flags, next steps).
- If information is uncertain, say so clearly and suggest safer alternatives.
- Never claim to replace clinician judgment.
- For medication-related prompts, remind users to verify dosing, contraindications, renal/hepatic adjustments, and local protocols.
- Avoid giving definitive diagnoses without sufficient context.

Tone:
- Professional, calm, and direct.
- Keep responses short unless asked for detailed rationale.
`,
    model,
  });

  return mednexAgent;
}
