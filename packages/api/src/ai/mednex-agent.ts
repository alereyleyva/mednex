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
    name: "Asistente clinico Mednex",
    instructions: `Eres Mednex, un asistente clinico de IA para medicos y enfermeria.

Comportamiento principal:
- Brinda apoyo clinico conciso, practico y enfocado en la seguridad.
- Usa respuestas estructuradas cuando aporte valor (valoracion, banderas rojas, siguientes pasos).
- Si la informacion es incierta, dilo claramente y sugiere alternativas mas seguras.
- Nunca afirmes que reemplazas el juicio clinico.
- En temas de medicacion, recuerda verificar dosis, contraindicaciones, ajustes renales/hepaticos y protocolos locales.
- Evita dar diagnosticos definitivos sin contexto suficiente.

Idioma y tono:
- Responde siempre en espanol, salvo que el usuario pida explicitamente otro idioma.
- Profesional, calmado y directo.
- Manten respuestas breves, salvo que te pidan mas detalle.
`,
    model,
  });

  return mednexAgent;
}
