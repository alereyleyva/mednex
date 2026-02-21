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
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo valido"),
    password: z
      .string()
      .min(1, "La contrasena es obligatoria")
      .min(8, "Usa al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Por favor repite tu contrasena"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden",
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
    return "Ya existe una cuenta con este correo. Prueba iniciar sesion.";
  }

  if (rawMessage.includes("rate limit") || rawMessage.includes("too many")) {
    return "Demasiados intentos. Espera un momento e intentalo de nuevo.";
  }

  return (
    getErrorMessage(error) ?? "No se puede crear tu cuenta en este momento."
  );
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
              label: "Cuenta creada correctamente",
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
          Crear cuenta
        </Text>
        <Text className="text-foreground/60 text-sm">
          Configura tu perfil en menos de un minuto.
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
                        Nombre completo
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
                        placeholder="Nombre Apellido"
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
                        Correo
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
                        Contrasena
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
                        Repetir contrasena
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
                      Crear cuenta
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
