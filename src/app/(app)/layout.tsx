import type { ReactNode } from "react";
import Link from "next/link";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full">
      <aside
        data-chrome
        className="hidden w-64 shrink-0 flex-col border-r bg-card px-4 py-6 lg:flex print:hidden"
      >
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="mt-8">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          data-chrome
          className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur print:hidden"
        >
          <MobileNav />
          <div className="flex-1" />
          <ThemeToggle />
          <UserMenu name={user.name} email={user.email} />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
