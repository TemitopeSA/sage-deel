import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sage — Workforce intelligence for Deel (concept)",
  description:
    "An independent product concept exploring how Deel could connect workforce economics, output signals, AI spend, and global hiring decisions into one decision intelligence layer. Not affiliated with Deel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen font-sans">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
        <Analytics />
      </body>
    </html>
  );
}
