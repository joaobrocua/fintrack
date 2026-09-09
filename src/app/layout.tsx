import type { Metadata } from "next";
import {
  Geist_Mono,
  Instrument_Serif,
  Schibsted_Grotesk,
} from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Body / UI — an editorial grotesque with clean geometry.
const sans = Schibsted_Grotesk({
  variable: "--font-sans-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Display — a high-contrast serif for headlines and hero figures.
const serif = Instrument_Serif({
  variable: "--font-serif-family",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
