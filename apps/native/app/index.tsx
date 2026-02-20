import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Button, Card, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup";

export default function AuthLandingScreen() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const foregroundColor = useThemeColor("foreground");
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Container className="px-6 py-8" isScrollable={false}>
        <View className="flex-1 items-center justify-center">
          <Spinner size="lg" color="default" />
          <Text className="mt-3 text-muted">Checking your session...</Text>
        </View>
      </Container>
    );
  }

  if (session?.user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Container className="px-6 py-8">
      <View className="mt-2 gap-6">
        <View className="mb-2 items-center justify-center">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Ionicons name="medkit" size={36} color={foregroundColor} />
          </View>
          <Text className="text-center font-extrabold text-4xl text-foreground tracking-tight">
            Mednex
          </Text>
          <Text className="mt-4 text-center text-base text-foreground/60 leading-6">
            AI-powered support for guided procedures, clinical knowledge, and
            image analysis.
          </Text>
        </View>

        <Card
          variant="secondary"
          className="rounded-2xl border border-default-200 p-2"
        >
          <Text className="mb-2 px-1 font-medium text-muted text-xs uppercase tracking-wide">
            Access
          </Text>
          <View className="flex-row rounded-xl bg-default-100 p-1">
            <Button
              className={`flex-1 rounded-lg ${mode === "signin" ? "bg-background shadow-sm" : "bg-transparent"}`}
              onPress={() => {
                setMode("signin");
              }}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons
                  name="log-in-outline"
                  size={16}
                  color={mode === "signin" ? foregroundColor : "#6b7280"}
                />
                <Button.Label
                  className={
                    mode === "signin"
                      ? "font-semibold text-foreground"
                      : "text-foreground/70"
                  }
                >
                  Log In
                </Button.Label>
              </View>
            </Button>
            <Button
              className={`flex-1 rounded-lg ${mode === "signup" ? "bg-background shadow-sm" : "bg-transparent"}`}
              onPress={() => {
                setMode("signup");
              }}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons
                  name="person-add-outline"
                  size={16}
                  color={mode === "signup" ? foregroundColor : "#6b7280"}
                />
                <Button.Label
                  className={
                    mode === "signup"
                      ? "font-semibold text-foreground"
                      : "text-foreground/70"
                  }
                >
                  Sign Up
                </Button.Label>
              </View>
            </Button>
          </View>
        </Card>

        <View className="mt-2 text-foreground">
          {mode === "signin" ? <SignIn /> : <SignUp />}
        </View>
      </View>
    </Container>
  );
}
