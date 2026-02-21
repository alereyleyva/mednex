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
          <View className="rounded-3xl bg-default-100 px-8 py-10">
            <View className="items-center gap-3">
              <Spinner size="lg" color="default" />
              <Text className="font-medium text-foreground">
                Preparing workspace
              </Text>
              <Text className="text-muted text-sm">
                Checking your session...
              </Text>
            </View>
          </View>
        </View>
      </Container>
    );
  }

  if (session?.user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Container className="px-5 py-6" scrollViewProps={{ bounces: false }}>
      <View className="relative flex-1 justify-center">
        <View className="absolute top-12 -left-14 h-40 w-40 rounded-full bg-primary/10" />
        <View className="absolute -right-12 bottom-16 h-52 w-52 rounded-full bg-default-100" />

        <View className="mx-auto w-full max-w-xl gap-6">
          <View className="items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-default-100">
              <Ionicons
                name="medkit-outline"
                size={28}
                color={foregroundColor}
              />
            </View>

            <View className="items-center gap-2">
              <Text className="font-extrabold text-4xl text-foreground tracking-tight">
                Welcome back
              </Text>
              <Text className="max-w-sm text-center text-base text-foreground/60 leading-6">
                Sign in to Mednex for guided procedures and fast clinical
                answers.
              </Text>
            </View>
          </View>

          <Card className="rounded-3xl bg-background/95 p-3">
            <View className="mb-3 flex-row rounded-2xl bg-default-100 p-1">
              <Button
                className={`flex-1 rounded-xl ${mode === "signin" ? "bg-background" : "bg-transparent"}`}
                onPress={() => {
                  setMode("signin");
                }}
              >
                <Button.Label
                  className={
                    mode === "signin"
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground/60"
                  }
                >
                  Sign In
                </Button.Label>
              </Button>

              <Button
                className={`flex-1 rounded-xl ${mode === "signup" ? "bg-background" : "bg-transparent"}`}
                onPress={() => {
                  setMode("signup");
                }}
              >
                <Button.Label
                  className={
                    mode === "signup"
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground/60"
                  }
                >
                  Create Account
                </Button.Label>
              </Button>
            </View>

            <View className="rounded-2xl bg-default-50 px-4 py-5">
              {mode === "signin" ? <SignIn /> : <SignUp />}
            </View>
          </Card>

          <Text className="px-4 text-center text-foreground/50 text-xs leading-5">
            By continuing, you agree to the Mednex Terms and Privacy Policy.
          </Text>
        </View>
      </View>
    </Container>
  );
}
