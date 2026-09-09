"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerAction, type AuthActionState } from "@/server/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando conta…" : "Criar conta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    registerAction,
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Criar conta</CardTitle>
        <CardDescription>
          Leva menos de um minuto. Categorias padrão já vêm prontas.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
          <AuthFormField
            label="Nome"
            name="name"
            autoComplete="name"
            required
            errors={state.fieldErrors?.name}
          />
          <AuthFormField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            errors={state.fieldErrors?.email}
          />
          <AuthFormField
            label="Senha"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            errors={state.fieldErrors?.password}
          />
          <AuthFormField
            label="Confirmar senha"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            errors={state.fieldErrors?.confirmPassword}
          />
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <SubmitButton />
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
