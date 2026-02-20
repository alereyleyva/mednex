import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function TabsLayout() {
  const { data: session, isPending } = authClient.useSession();
  const foregroundColor = useThemeColor("foreground");
  const backgroundColor = useThemeColor("background");

  if (isPending) {
    return (
      <Container className="px-6 py-8" isScrollable={false}>
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color="default" />
          <Text className="mt-3 text-muted">Loading workspace...</Text>
        </View>
      </Container>
    );
  }

  if (!session?.user) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: foregroundColor,
        headerTitleStyle: {
          color: foregroundColor,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Chat",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
