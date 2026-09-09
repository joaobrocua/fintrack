import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="reveal w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Logo className="text-[1.15rem]" />
        </Link>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Um projeto de portfólio. Nada de dinheiro real por aqui.
        </p>
      </div>
    </div>
  );
}
