import { Ionicons } from "@expo/vector-icons";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";

const moduleCards = [
  {
    title: "Guided Procedures",
    description:
      "Step-by-step clinical workflows with safety checks and escalation prompts.",
    icon: "medkit-outline",
  },
  {
    title: "Medical Knowledge Base",
    description:
      "Fast retrieval of protocols, differential references, and evidence summaries.",
    icon: "library-outline",
  },
  {
    title: "Advanced Image Analysis",
    description:
      "Assistive interpretation workflows for radiology, wound care, and triage images.",
    icon: "scan-outline",
  },
];

export default function HomeTabScreen() {
  const foregroundColor = useThemeColor("foreground");

  return (
    <Container className="p-6">
      <View className="gap-4 pb-6">
        <View className="rounded-3xl bg-primary p-6">
          <Chip color="default" size="sm" className="mb-3 self-start">
            <Chip.Label>Clinical Assistant Workspace</Chip.Label>
          </Chip>
          <Text className="font-bold text-3xl text-primary-foreground">
            Mednex
          </Text>
          <Text className="mt-2 text-base text-primary-foreground/85 leading-6">
            Your AI co-pilot for faster, safer decisions across procedures,
            clinical documentation, and patient communication.
          </Text>
        </View>

        <Card variant="secondary" className="rounded-2xl p-5">
          <Card.Title className="mb-2">Feature Modules</Card.Title>
          <Card.Description>
            This space is prepared for future modules and widgets that can be
            enabled per role.
          </Card.Description>
          <View className="mt-4 gap-3">
            {moduleCards.map((module) => (
              <Card key={module.title} className="rounded-xl p-4">
                <View className="flex-row items-start gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                    <Ionicons
                      name={module.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={foregroundColor}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-base text-foreground">
                      {module.title}
                    </Text>
                    <Text className="mt-1 text-muted">
                      {module.description}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </Card>

        <Card variant="secondary" className="rounded-2xl p-5">
          <Card.Title className="mb-2">AI Chat Ready</Card.Title>
          <Card.Description>
            Open the AI Chat tab to ask triage, diagnosis-support, and
            procedure-planning questions.
          </Card.Description>
        </Card>
      </View>
    </Container>
  );
}
