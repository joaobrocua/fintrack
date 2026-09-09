import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Body / UI — a neutral workhorse, so the display face carries the character.
const sans = Inter({
  variable: "--font-sans-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Display — Fraunces, run at its display optical size with a little softness
// and the "wonk" alternates on, so it never reads as the flat default cut.
const serif = Fraunces({
  variable: "--font-serif-family",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DESCRIPTION =
  "Importe o extrato do banco, categorize gastos automaticamente e veja para onde vai o seu dinheiro.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FinTrack — controle financeiro pessoal",
    template: "%s · FinTrack",
  },
  description: DESCRIPTION,
  applicationName: "FinTrack",
  openGraph: {
    title: "FinTrack — controle financeiro pessoal",
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "FinTrack",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary", title: "FinTrack", description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
