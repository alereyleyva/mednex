import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Input } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

function buildAssistantReply(prompt: string): string {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("triage")) {
    return "For triage support, I can help structure acuity assessment, red flags, and immediate actions. Share patient context to continue.";
  }

  if (normalized.includes("drug") || normalized.includes("medication")) {
    return "I can summarize common medication considerations, but always validate dose, contraindications, and local protocols before prescribing.";
  }

  return "I can help with clinical reasoning, procedure checklists, and concise evidence summaries. Ask me a specific patient-care question to begin.";
}

export default function ChatTabScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello, I am Mednex AI. Ask me about procedures, diagnosis support, differential suggestions, or clinical references.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  function handleSend() {
    const prompt = input.trim();

    if (!prompt) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: prompt,
    };

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: buildAssistantReply(prompt),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
  }

  return (
    <Container isScrollable={false} className="p-4">
      <View className="flex-1 gap-3">
        <Card variant="secondary" className="rounded-2xl p-4">
          <Card.Title>AI Clinical Chat</Card.Title>
          <Card.Description>
            Responses are assistive and should be validated against your
            institution guidelines.
          </Card.Description>
        </Card>

        <Card variant="secondary" className="flex-1 rounded-2xl p-3">
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
          </ScrollView>

          <View className="flex-row items-center gap-2 pt-2">
            <Input
              value={input}
              onChangeText={setInput}
              placeholder="Ask a clinical question..."
              className="flex-1"
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <Button isDisabled={!canSend} onPress={handleSend} className="px-4">
              <Ionicons name="send" size={16} color="white" />
            </Button>
          </View>
        </Card>
      </View>
    </Container>
  );
}
