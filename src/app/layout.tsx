import type { Metadata } from "next";
import "./globals.css";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

export const metadata: Metadata = {
  title: `Trainer Jobs — ${gymName}`,
  description: `${gymName} is hiring certified gym trainers. Apply online in 2 minutes.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
