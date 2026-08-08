import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import ThemeScript from "@/components/site/theme-script";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "My Blog",
    template: "%s · My Blog",
  },
  description: "A modern blog built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
