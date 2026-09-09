import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display serif — used for headings and hero figures.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
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
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
