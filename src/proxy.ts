import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/categories",
  "/rules",
  "/budgets",
  "/reports",
  "/import",
  "/settings",
];

const AUTH_PAGES = ["/login", "/register"];

/** Auth.js session cookie names (dev vs. HTTPS). */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSession(req: NextRequest) {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}

/**
 * Optimistic auth routing only — the real ownership checks happen in the DAL
 * (`requireUser`) on every protected page and action.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = hasSession(req);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !authed) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && authed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
