import { Badge } from "@/app/components/ui/badge";
import type { Stage } from "@/app/lib/types";

const STAGE_CONFIG: Record<Stage, { variant: "default" | "secondary" | "success" | "warning" | "danger" | "brand" }> = {
  "Intake": { variant: "secondary" },
  "Document Collection": { variant: "brand" },
  "Lender Review": { variant: "warning" },
  "Negotiation": { variant: "default" },
  "Approval": { variant: "success" },
  "Closing": { variant: "brand" },
  "Completed": { variant: "success" },
  "Rejected": { variant: "danger" },
};

export function StageBadge({ stage }: { stage: Stage }) {
  const config = STAGE_CONFIG[stage];
  return <Badge variant={config.variant}>{stage}</Badge>;
}