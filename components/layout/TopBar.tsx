"use client";

import * as Popover from "@radix-ui/react-popover";
import { Bell, CircleHelp, Command, FlaskConical, Keyboard, Map, Play, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

function MenuItem({
  icon: Icon,
  title,
  body,
  onSelect,
  kbd,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  onSelect: () => void;
  kbd?: string;
}) {
  return (
    <Popover.Close asChild>
      <button
        onClick={onSelect}
        className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-canvas"
      >
        <Icon className="mt-0.5 size-4 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-ink">{title}</span>
          <span className="block text-[12px] text-muted">{body}</span>
        </span>
        {kbd && <kbd className="rounded border border-line px-1.5 text-[11px] text-muted">{kbd}</kbd>}
      </button>
    </Popover.Close>
  );
}

export function TopBar() {
  const { setPaletteOpen, startTour, startDemo, openModal } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-6 backdrop-blur-md">
      <button
        onClick={() => setPaletteOpen(true)}
        className="group flex h-10 w-full max-w-[520px] items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 text-left text-[13.5px] text-subtle shadow-card transition-colors hover:border-[#d9d4ca]"
        aria-label="Search or ask Deel AI"
      >
        <Search className="size-4 text-muted" />
        <span className="flex-1">Search or ask Deel AI</span>
        <kbd className="flex items-center gap-0.5 rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-muted">
          <Command className="size-3" />K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="mr-1 inline-flex h-7 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border border-dashed border-[#cfc9bd] px-2.5 text-[12px] font-medium text-muted transition-colors hover:border-brand hover:text-brand">
              <FlaskConical className="size-3.5" />
              Concept mode
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 w-80 rounded-xl border border-line bg-surface p-4 shadow-pop data-[state=open]:animate-scale-in"
            >
              <p className="text-[13px] font-semibold">You&apos;re exploring an independent product concept</p>
              <p className="mt-1.5 text-[13px] text-muted">
                Sage is a portfolio prototype using fictional data for a fictional company, Northwind Labs. It is not affiliated with, endorsed by, or representative of Deel.
              </p>
              <Popover.Close asChild>
                <Button variant="link" className="mt-2 text-[13px]" onClick={() => openModal("concept")}>
                  Read the product thesis →
                </Button>
              </Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Button
          variant="secondary"
          size="sm"
          onClick={startDemo}
          className="hidden xl:inline-flex"
          data-tour="demo-button"
        >
          <Play className="!size-3.5 fill-current" />
          Executive demo
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-risk" aria-hidden />
        </Button>

        <Popover.Root>
          <Popover.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Help and product tour">
              <CircleHelp className="size-[18px]" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 w-80 rounded-xl border border-line bg-surface p-1.5 shadow-pop data-[state=open]:animate-scale-in"
            >
              <MenuItem icon={Map} title="Product tour" body="A 2-minute guided walkthrough" onSelect={startTour} />
              <MenuItem icon={Play} title="Executive demo mode" body="Auto-plays the story — built for recording" onSelect={startDemo} />
              <MenuItem icon={Keyboard} title="Command palette" body="Jump anywhere, run actions" kbd="⌘K" onSelect={() => setPaletteOpen(true)} />
              <MenuItem icon={FlaskConical} title="About this concept" body="Thesis, data and disclaimer" onSelect={() => openModal("concept")} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <span className="ml-1 grid size-9 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white" aria-label="Temitope">
          T
        </span>
      </div>
    </header>
  );
}
