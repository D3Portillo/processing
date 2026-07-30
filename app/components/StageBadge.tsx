import { Chip } from "@mui/material";
import type { Stage } from "@/app/lib/types";

const STAGE_COLOR: Record<Stage, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  "Processing": "info",
  "TPA Pending": "default",
  "Sub Pending": "default",
  "Submitted": "primary",
  "Underwriting": "secondary",
  "Missing Documents": "warning",
  "Approved": "success",
  "Pending Approved": "primary",
  "Denied": "error",
  "Escalation": "error",
  "Closed": "success",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return <Chip label={stage} size="small" color={STAGE_COLOR[stage]} variant="outlined" />;
}