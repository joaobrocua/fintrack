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
import { loginAction, type AuthActionState } from "@/server/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    loginAction,
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para ver seu painel financeiro.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
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
            autoComplete="current-password"
            required
            errors={state.fieldErrors?.password}
          />
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <SubmitButton />
          <p className="text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
