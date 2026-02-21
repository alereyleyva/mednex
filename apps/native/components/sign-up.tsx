import { useForm } from "@tanstack/react-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  useToast,
} from "heroui-native";
import { useRef, useState } from "react";
import { Text, type TextInput, View } from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Please repeat your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    for (const issue of error) {
      const message = getErrorMessage(issue);
      if (message) {
        return message;
      }
    }
    return null;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: unknown };
    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return null;
}

function normalizeSignUpError(error: unknown): string {
  const rawMessage = getErrorMessage(error)?.toLowerCase() ?? "";

  if (
    rawMessage.includes("already exists") ||
    rawMessage.includes("already registered") ||
    rawMessage.includes("duplicate")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (rawMessage.includes("rate limit") || rawMessage.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return getErrorMessage(error) ?? "Unable to create your account right now.";
}

export function SignUp() {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null);

      await authClient.signUp.email(
        {
          name: value.name.trim(),
          email: value.email.trim(),
          password: value.password,
        },
        {
          onError(error) {
            const message = normalizeSignUpError(error.error?.message || error);
            setServerError(message);

            toast.show({
              variant: "danger",
              label: message,
            });
          },
          onSuccess() {
            setServerError(null);
            formApi.reset();
            toast.show({
              variant: "success",
              label: "Account created successfully",
            });
            queryClient.refetchQueries();
          },
        },
      );
    },
  });

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="font-semibold text-foreground text-lg">
          Create account
        </Text>
        <Text className="text-foreground/60 text-sm">
          Set up your profile in under a minute.
        </Text>
      </View>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          validationError: getErrorMessage(state.errorMap.onSubmit),
        })}
      >
        {({ isSubmitting, validationError }) => {
          const formError = serverError || validationError;

          return (
            <>
              <FieldError isInvalid={!!formError} className="mb-3">
                {formError}
              </FieldError>

              <View className="gap-4">
                <form.Field name="name">
                  {(field) => (
                    <TextField>
                      <Label className="mb-1 text-foreground/70 text-xs uppercase tracking-wide">
                        Full Name
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={(text) => {
                          if (serverError) {
                            setServerError(null);
                          }
                          field.handleChange(text);
                        }}
                        placeholder="John Doe"
                        autoComplete="name"
                        textContentType="name"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          emailInputRef.current?.focus();
                        }}
                      />
                      <FieldError
                        isInvalid={!!getErrorMessage(field.state.meta.errors)}
                        className="mt-1"
                      >
                        {getErrorMessage(field.state.meta.errors)}
                      </FieldError>
                    </TextField>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <TextField>
                      <Label className="mb-1 text-foreground/70 text-xs uppercase tracking-wide">
                        Email
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        ref={emailInputRef}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={(text) => {
                          if (serverError) {
                            setServerError(null);
                          }
                          field.handleChange(text);
                        }}
                        placeholder="email@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          passwordInputRef.current?.focus();
                        }}
                      />
                      <FieldError
                        isInvalid={!!getErrorMessage(field.state.meta.errors)}
                        className="mt-1"
                      >
                        {getErrorMessage(field.state.meta.errors)}
                      </FieldError>
                    </TextField>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <TextField>
                      <Label className="mb-1 text-foreground/70 text-xs uppercase tracking-wide">
                        Password
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        ref={passwordInputRef}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={(text) => {
                          if (serverError) {
                            setServerError(null);
                          }
                          field.handleChange(text);
                        }}
                        placeholder="••••••••"
                        secureTextEntry
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          confirmPasswordInputRef.current?.focus();
                        }}
                      />
                      <FieldError
                        isInvalid={!!getErrorMessage(field.state.meta.errors)}
                        className="mt-1"
                      >
                        {getErrorMessage(field.state.meta.errors)}
                      </FieldError>
                    </TextField>
                  )}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => (
                    <TextField>
                      <Label className="mb-1 text-foreground/70 text-xs uppercase tracking-wide">
                        Repeat Password
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        ref={confirmPasswordInputRef}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={(text) => {
                          if (serverError) {
                            setServerError(null);
                          }
                          field.handleChange(text);
                        }}
                        placeholder="••••••••"
                        secureTextEntry
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="go"
                        onSubmitEditing={form.handleSubmit}
                      />
                      <FieldError
                        isInvalid={!!getErrorMessage(field.state.meta.errors)}
                        className="mt-1"
                      >
                        {getErrorMessage(field.state.meta.errors)}
                      </FieldError>
                    </TextField>
                  )}
                </form.Field>

                <Button
                  onPress={form.handleSubmit}
                  isDisabled={isSubmitting}
                  className="mt-1 h-12 rounded-xl"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="default" />
                  ) : (
                    <Button.Label className="font-semibold">
                      Create Account
                    </Button.Label>
                  )}
                </Button>
              </View>
            </>
          );
        }}
      </form.Subscribe>
    </View>
  );
}
