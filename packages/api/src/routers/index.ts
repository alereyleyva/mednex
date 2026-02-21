import { env } from "@mednex/env/server";
import type { RouterClient } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { getMednexAgent } from "../ai/mednex-agent";

import { protectedProcedure, publicProcedure } from "../index";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
});

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "Esto es privado",
      user: context.session?.user,
    };
  }),
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema).min(1).max(30),
      }),
    )
    .handler(async ({ input }) => {
      if (!env.OPENROUTER_API_KEY) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "OPENROUTER_API_KEY no esta configurada en el servidor",
        });
      }

      const agent = getMednexAgent();

      if (!agent) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "No se pudo inicializar el agente de IA de Mednex",
        });
      }

      const conversation = input.messages
        .map(
          (message) =>
            `${message.role === "user" ? "Profesional de salud" : "Asistente"}: ${message.content}`,
        )
        .join("\n");

      const response = await agent.generate(
        `Continua este chat clinico y entrega solo la siguiente respuesta del asistente en espanol.\n\n${conversation}`,
      );

      const text = response.text?.trim();

      if (!text) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "El proveedor de IA no genero respuesta",
        });
      }

      return {
        content: text,
      };
    }),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
