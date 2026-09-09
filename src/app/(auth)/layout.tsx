import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Logo className="text-lg" />
        </Link>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
