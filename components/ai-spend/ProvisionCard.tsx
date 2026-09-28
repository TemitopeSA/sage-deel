"use client";

import { Laptop } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pendingProvisioning } from "@/data/aiSpend";
import { useApp } from "@/lib/store";

export function ProvisionCard() {
  const { openModal } = useApp();
  return (
    <Card className="flex items-center gap-4 p-5" data-tour="provision">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sun-50 text-sun-700">
        <Laptop className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">AI access provisioning</p>
        <p className="mt-0.5 text-[13px] text-muted">
          {pendingProvisioning.count} approved AI seats are waiting for new hires starting in the next 3 weeks.
        </p>
      </div>
      <Button variant="dark" onClick={() => openModal("provision")}>Provision via Deel IT</Button>
    </Card>
  );
}
