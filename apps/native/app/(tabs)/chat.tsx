import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Input } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Container } from "@/components/container";
import { orpc } from "@/utils/orpc";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export default function ChatTabScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy Mednex IA. Preguntame sobre procedimientos, apoyo diagnostico, sugerencias diferenciales o referencias clinicas.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const chatMutation = useMutation(
    orpc.chat.mutationOptions({
      onError(error) {
        setErrorMessage(
          error.message ||
            "No se puede conectar con el servicio de IA en este momento.",
        );
      },
    }),
  );

  async function handleSend() {
    const prompt = input.trim();

    if (!prompt) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: prompt,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setErrorMessage(null);

    const result = await chatMutation.mutateAsync({
      messages: nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: result.content,
      },
    ]);
  }

  return (
    <Container
      isScrollable={false}
      className="px-3"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`max-w-[88%] rounded-xl p-3 ${
                message.role === "user"
                  ? "self-end bg-primary"
                  : "self-start bg-secondary"
              }`}
            >
              <Text
                className={
                  message.role === "user"
                    ? "text-primary-foreground"
                    : "text-foreground"
                }
              >
                {message.content}
              </Text>
            </View>
          ))}
          {chatMutation.isPending && (
            <View className="self-start rounded-xl bg-secondary p-3">
              <Text className="text-foreground">Pensando...</Text>
            </View>
          )}
        </ScrollView>

        {errorMessage && (
          <Text className="pb-2 text-danger text-sm">{errorMessage}</Text>
        )}

        <View className="flex-row items-center gap-2 py-2">
          <Input
            value={input}
            onChangeText={setInput}
            placeholder="Haz una pregunta clinica..."
            className="flex-1"
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Button
            isDisabled={!canSend || chatMutation.isPending}
            onPress={handleSend}
            className="px-4"
          >
            <Ionicons name="send" size={16} color="white" />
          </Button>
        </View>
      </View>
    </Container>
  );
}
