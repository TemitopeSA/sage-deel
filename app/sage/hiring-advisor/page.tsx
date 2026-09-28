import { PageHeader } from "@/components/dashboard/PageHeader";
import { HiringAdvisor } from "@/components/advisor/HiringAdvisor";

export default function HiringAdvisorPage() {
  return (
    <>
      <PageHeader title="Hiring Advisor" subtitle="Turn workforce data into your next hiring decision." />
      <HiringAdvisor />
    </>
  );
}
