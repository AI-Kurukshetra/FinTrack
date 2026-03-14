import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ColorModeProvider } from "@/components/providers/ColorModeProvider";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FinTrack AI",
    template: "%s | FinTrack AI",
  },
  description: "AI-powered personal expense tracker for India.",
  applicationName: "FinTrack AI",
  keywords: ["FinTrack", "expenses", "budget", "AI insights", "Supabase", "Next.js"],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "FinTrack AI",
    description: "AI-powered personal expense tracker for India.",
    url: "/",
    siteName: "FinTrack AI",
    images: [{ url: "/icon.svg" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FinTrack AI",
    description: "AI-powered personal expense tracker for India.",
    images: ["/icon.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#040d14" },
  ],
  colorScheme: "light dark",
};

/**
 * Root application layout.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-emerald" suppressHydrationWarning>
      <body className="font-sans antialiased transition-colors duration-300" suppressHydrationWarning>
        <ColorModeProvider>{children}</ColorModeProvider>
      </body>
    </html>
  );
}
