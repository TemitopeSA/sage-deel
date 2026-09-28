"use client";

import * as React from "react";
import { CircleCheck, LoaderCircle, Plug, RefreshCw, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

type Status = "connected" | "error" | "syncing" | "none";

const initial: { name: string; kind: string; status: Status; synced: string }[] = [
  { name: "Deel HRIS", kind: "Workers, roles, teams", status: "connected", synced: "2 min ago" },
  { name: "Deel Payroll", kind: "Compensation, taxes", status: "connected", synced: "2 min ago" },
  { name: "Deel IT", kind: "Devices, software, AI seats", status: "connected", synced: "5 min ago" },
  { name: "GitHub", kind: "PRs, cycle time", status: "connected", synced: "12 min ago" },
  { name: "Jira", kind: "Tickets, incidents", status: "error", synced: "6 hours ago" },
  { name: "Salesforce", kind: "Pipeline, renewals", status: "connected", synced: "18 min ago" },
  { name: "Zendesk", kind: "Support volume", status: "none", synced: "" },
];

export function Connectors() {
  const [items, setItems] = React.useState(initial);
  const { toast } = useApp();
  const hasError = items.some((i) => i.status === "error");

  const retry = (name: string) => {
    setItems((xs) => xs.map((x) => (x.name === name ? { ...x, status: "syncing" } : x)));
    window.setTimeout(() => {
      setItems((xs) => xs.map((x) => (x.name === name ? { ...x, status: "connected", synced: "just now" } : x)));
      toast(`${name} refreshed`, "Activity signals are up to date. Output Index recalculated.");
    }, 1400);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold">Connected data sources</p>
          <span className="rounded-md border border-dashed border-line px-1.5 py-0.5 text-[11px] text-subtle">Illustrative data connections</span>
        </div>
        {hasError && (
          <p role="alert" className="flex items-center gap-1.5 text-[12.5px] text-warn">
            <TriangleAlert className="size-3.5" />
            Some activity data could not be refreshed.
          </p>
        )}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {items.map((c) => (
          <li
            key={c.name}
            className={cn(
              "flex flex-col rounded-xl border px-3 py-2.5",
              c.status === "error" ? "border-warn/30 bg-warn-50/60" : c.status === "none" ? "border-dashed border-line" : "border-line-2 bg-[#fbfaf7]",
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-[13px] font-medium">{c.name}</span>
              {c.status === "connected" && <CircleCheck className="size-3.5 shrink-0 text-pos" aria-label="Connected" />}
              {c.status === "error" && <TriangleAlert className="size-3.5 shrink-0 text-warn" aria-label="Sync failed" />}
              {c.status === "syncing" && <LoaderCircle className="size-3.5 shrink-0 animate-spin text-brand" aria-label="Syncing" />}
              {c.status === "none" && <Plug className="size-3.5 shrink-0 text-subtle" aria-label="Not connected" />}
            </span>
            <span className="mt-0.5 truncate text-[11.5px] text-muted">{c.kind}</span>
            <span className="mt-1.5 text-[11.5px]">
              {c.status === "connected" && <span className="text-subtle">Synced {c.synced}</span>}
              {c.status === "syncing" && <span className="text-brand">Refreshing…</span>}
              {c.status === "error" && (
                <button onClick={() => retry(c.name)} className="inline-flex items-center gap-1 font-medium text-warn hover:underline">
                  <RefreshCw className="size-3" /> Retry sync
                </button>
              )}
              {c.status === "none" && (
                <Button variant="link" className="text-[11.5px]" onClick={() => toast("Connector setup is outside this concept", "No connected activity data yet — CS output uses Salesforce signals only.")}>
                  Connect
                </Button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
