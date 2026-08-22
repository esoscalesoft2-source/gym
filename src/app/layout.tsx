import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic", "normal"],
  variable: "--font-display",
  display: "swap",
});

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

export const metadata: Metadata = {
  title: `Trainer Jobs — ${gymName}`,
  description: `${gymName} is hiring certified gym trainers. Apply online in 2 minutes.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
