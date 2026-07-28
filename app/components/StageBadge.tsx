import { Chip } from "@mui/material";
import type { Stage } from "@/app/lib/types";

const STAGE_COLOR: Record<Stage, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  "Intake": "default",
  "Document Collection": "secondary",
  "Lender Review": "info",
  "Negotiation": "primary",
  "Approval": "success",
  "Closing": "primary",
  "Completed": "success",
  "Rejected": "error",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return <Chip label={stage} size="small" color={STAGE_COLOR[stage]} variant="outlined" />;
}