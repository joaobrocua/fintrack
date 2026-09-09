import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validation/auth";

/** One structured line per failed credential attempt — a hook for alerting. */
function logAuthFailure(
  reason: "bad_input" | "no_user" | "bad_password",
  email: string | undefined,
  request: Request | undefined,
) {
  const masked = email?.replace(/^(.).*(@.*)$/, "$1***$2") ?? null;
  console.warn(
    JSON.stringify({
      evt: "auth.login_failed",
      reason,
      email: masked,
      ip:
        request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request?.headers.get("x-real-ip") ??
        null,
      ts: new Date().toISOString(),
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          logAuthFailure("bad_input", undefined, request);
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          logAuthFailure("no_user", email, request);
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          logAuthFailure("bad_password", email, request);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user?.id) token.id = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
