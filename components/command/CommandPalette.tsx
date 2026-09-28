"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChartColumn, Download, LayoutDashboard, Map, MessageSquare, Play, Route, Search, Sparkles, Users } from "lucide-react";
import { scenarioQueries, useApp, type ScenarioId } from "@/lib/store";

export function CommandPalette() {
  const router = useRouter();
  const app = useApp();
  const { paletteOpen, setPaletteOpen } = app;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen]);

  const run = (fn: () => void) => {
    setPaletteOpen(false);
    window.setTimeout(fn, 60);
  };
  const ask = (id: ScenarioId) =>
    run(() => {
      app.runAdvisor(id);
      router.push("/sage/hiring-advisor");
    });

  const item =
    "flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-[13.5px] text-ink-2 data-[selected=true]:bg-canvas data-[selected=true]:text-ink [&_svg]:size-4 [&_svg]:text-muted";
  const group = "px-1.5 pb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-subtle";

  return (
    <DialogPrimitive.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-[rgb(22_21_27/0.35)] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[14vh] z-[60] w-[calc(100vw-32px)] max-w-[600px] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-pop outline-none data-[state=open]:animate-scale-in">
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Search Sage or run an action</DialogPrimitive.Description>
          <Command label="Command palette" loop>
            <div className="flex items-center gap-3 border-b border-line-2 px-4">
              <Search className="size-4 text-muted" />
              <Command.Input
                autoFocus
                placeholder="Search or ask Deel AI…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted">esc</kbd>
            </div>
            <Command.List className="scrollbar-thin max-h-[420px] overflow-y-auto pb-2">
              <Command.Empty className="px-4 py-8 text-center text-[13px] text-muted">No results. Try &ldquo;hire&rdquo; or &ldquo;AI spend&rdquo;.</Command.Empty>
              <Command.Group heading="Deel AI" className={group}>
                <Command.Item className={item} onSelect={() => run(() => router.push("/sage/hiring-advisor"))}>
                  <Sparkles /> Ask Deel AI
                </Command.Item>
                {(Object.keys(scenarioQueries) as ScenarioId[]).map((id) => (
                  <Command.Item key={id} className={item} value={`ask ${scenarioQueries[id]}`} onSelect={() => ask(id)}>
                    <MessageSquare /> {scenarioQueries[id]}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Navigate" className={group}>
                <Command.Item className={item} onSelect={() => run(() => router.push("/sage"))}>
                  <LayoutDashboard /> Go to Workforce Intelligence
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/sage/team-economics"))}>
                  <Users /> View Team Economics
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/sage/ai-spend"))}>
                  <ChartColumn /> View AI Spend
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => router.push("/sage/hiring-advisor"))}>
                  <Sparkles /> Open Hiring Advisor
                </Command.Item>
              </Command.Group>
              <Command.Group heading="Actions" className={group}>
                <Command.Item className={item} onSelect={() => run(app.startTour)}>
                  <Map /> Start Product Tour
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(app.startDemo)}>
                  <Play /> Start Executive demo
                </Command.Item>
                <Command.Item className={item} onSelect={() => run(() => app.openModal("export", "overview"))}>
                  <Download /> Export report
                </Command.Item>
                <Command.Item
                  className={item}
                  onSelect={() =>
                    run(() => {
                      app.setSmartRouting(!app.smartRouting);
                      router.push("/sage/ai-spend");
                    })
                  }
                >
                  <Route /> {app.smartRouting ? "Disable" : "Enable"} AI Smart Routing
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
