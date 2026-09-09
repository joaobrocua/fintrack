"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { defaultCategoriesFor } from "@/lib/default-categories";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function throttle(
  scope: string,
  limit: number,
  windowMs: number,
): Promise<AuthActionState | null> {
  const ip = clientIpFrom(await headers());
  const { ok, retryAfterSeconds } = rateLimit(
    `${scope}:${ip}`,
    limit,
    windowMs,
  );
  if (ok) return null;
  const mins = Math.ceil(retryAfterSeconds / 60);
  return {
    error: `Muitas tentativas. Tente de novo em ${mins} min.`,
  };
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const limited = await throttle("register", 5, 60 * 60 * 1000);
  if (limited) return limited;

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["Este e-mail já está cadastrado"] } };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true },
  });

  await prisma.category.createMany({ data: defaultCategoriesFor(user.id) });

  // `signIn` throws a redirect error on success — let it propagate.
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Conta criada, mas o login automático falhou. Entre manualmente.",
      };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const limited = await throttle("login", 8, 10 * 60 * 1000);
  if (limited) return limited;

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const callbackUrl =
    (formData.get("callbackUrl") as string | null) || "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos" };
    }
    throw error;
  }

  return {};
}
