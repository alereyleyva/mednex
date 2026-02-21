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
import { useRef } from "react";
import { Text, type TextInput, View } from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo valido"),
  password: z
    .string()
    .min(1, "La contrasena es obligatoria")
    .min(8, "Usa al menos 8 caracteres"),
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

function normalizeSignInError(error: unknown): string {
  const rawMessage = getErrorMessage(error)?.toLowerCase() ?? "";

  if (
    rawMessage.includes("invalid credential") ||
    rawMessage.includes("invalid email or password") ||
    rawMessage.includes("user not found")
  ) {
    return "El correo o la contrasena son incorrectos. Intentalo de nuevo.";
  }

  if (rawMessage.includes("too many") || rawMessage.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e intentalo de nuevo.";
  }

  return (
    getErrorMessage(error) ??
    "No se puede iniciar sesion en este momento. Intentalo de nuevo."
  );
}

function SignIn() {
  const passwordInputRef = useRef<TextInput>(null);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await authClient.signIn.email(
        {
          email: value.email.trim(),
          password: value.password,
        },
        {
          onError(error) {
            const message = normalizeSignInError(error.error?.message || error);
            toast.show({
              variant: "danger",
              label: message,
            });
          },
          onSuccess() {
            formApi.reset();
            toast.show({
              variant: "success",
              label: "Sesion iniciada correctamente",
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
          Iniciar sesion
        </Text>
        <Text className="text-foreground/60 text-sm">
          Continua con las credenciales de tu cuenta.
        </Text>
      </View>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          validationError: getErrorMessage(state.errorMap.onSubmit),
        })}
      >
        {({ isSubmitting, validationError }) => {
          const formError = validationError;

          return (
            <>
              <FieldError isInvalid={!!formError} className="mb-3">
                {formError}
              </FieldError>

              <View className="gap-4">
                <form.Field name="email">
                  {(field) => (
                    <TextField>
                      <Label className="mb-1 text-foreground/70 text-xs uppercase tracking-wide">
                        Correo
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
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
                        Contrasena
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        ref={passwordInputRef}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
                        placeholder="••••••••"
                        secureTextEntry
                        autoComplete="password"
                        textContentType="password"
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
                      Iniciar sesion
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

export { SignIn };
