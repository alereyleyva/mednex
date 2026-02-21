import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

export default function AccountTabScreen() {
  const { data: session } = authClient.useSession();
  const privateData = useQuery(orpc.privateData.queryOptions());

  return (
    <Container className="p-6">
      <View className="gap-6 pb-6">
        <Card variant="secondary" className="rounded-2xl p-5">
          <Card.Title className="mb-3 font-bold text-lg">Perfil</Card.Title>
          <Text className="font-semibold text-base text-foreground">
            {session?.user.name}
          </Text>
          <Text className="text-muted">{session?.user.email}</Text>

          <Button
            className="mt-6 self-start bg-danger shadow-sm"
            onPress={() => {
              authClient.signOut();
              queryClient.invalidateQueries();
            }}
          >
            <Button.Label className="font-medium text-white">
              Cerrar sesion
            </Button.Label>
          </Button>
        </Card>

        <Card variant="secondary" className="rounded-2xl p-5">
          <Card.Title className="mb-2 font-semibold text-base">
            Datos privados de la API
          </Card.Title>
          <Card.Description className="text-muted">
            {privateData.data?.message ?? "Cargando datos privados..."}
          </Card.Description>
        </Card>
      </View>
    </Container>
  );
}
