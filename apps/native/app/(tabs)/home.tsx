import { Ionicons } from "@expo/vector-icons";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";

const moduleCards = [
  {
    title: "Procedimientos guiados",
    description:
      "Flujos clinicos paso a paso con verificaciones de seguridad y alertas de escalamiento.",
    icon: "medkit-outline",
  },
  {
    title: "Base de conocimiento medico",
    description:
      "Consulta rapida de protocolos, referencias diferenciales y resumenes de evidencia.",
    icon: "library-outline",
  },
  {
    title: "Analisis avanzado de imagenes",
    description:
      "Flujos de apoyo para interpretar imagenes de radiologia, cuidado de heridas y triaje.",
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
            <Chip.Label>Espacio de asistente clinico</Chip.Label>
          </Chip>
          <Text className="font-bold text-3xl text-primary-foreground">
            Mednex
          </Text>
          <Text className="mt-2 text-base text-primary-foreground/85 leading-6">
            Tu copiloto de IA para decisiones mas rapidas y seguras en
            procedimientos, documentacion clinica y comunicacion con pacientes.
          </Text>
        </View>

        <Card variant="secondary" className="rounded-2xl p-5">
          <Card.Title className="mb-2">Modulos de funciones</Card.Title>
          <Card.Description>
            Este espacio esta preparado para futuros modulos y widgets que se
            pueden habilitar por rol.
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
          <Card.Title className="mb-2">Chat IA disponible</Card.Title>
          <Card.Description>
            Abre la pestana de Chat IA para hacer preguntas de triaje, apoyo
            diagnostico y planificacion de procedimientos.
          </Card.Description>
        </Card>
      </View>
    </Container>
  );
}
