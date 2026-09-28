"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toasts } from "./Toasts";
import { CommandPalette } from "@/components/command/CommandPalette";
import { WelcomePanel } from "@/components/tour/WelcomePanel";
import { Tour } from "@/components/tour/Tour";
import { ExecutiveDemo } from "@/components/tour/ExecutiveDemo";
import { ModalHost } from "@/components/modals/ModalHost";
import { WorkerPanel } from "@/components/team/WorkerPanel";
import { CountryDetail } from "@/components/dashboard/CountryDetail";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main" className="flex-1 px-8 pb-10 pt-7">
          <div className="mx-auto max-w-[1240px]">{children}</div>
        </main>
        <footer className="px-8 pb-6 text-center text-[12px] text-subtle">
          Independent concept prototype — not affiliated with Deel. All company, worker and financial data is fictional.
        </footer>
      </div>

      <CommandPalette />
      <WorkerPanel />
      <CountryDetail />
      <ModalHost />
      <WelcomePanel />
      <Tour />
      <ExecutiveDemo />
      <Toasts />
    </div>
  );
}
