import { Tag } from "@carbon/react";
import type { Stage } from "@/app/lib/types";

const STAGE_TYPE: Record<Stage, "red" | "magenta" | "purple" | "blue" | "cyan" | "teal" | "green" | "gray"> = {
  "Intake": "gray",
  "Document Collection": "purple",
  "Lender Review": "blue",
  "Negotiation": "cyan",
  "Approval": "green",
  "Closing": "teal",
  "Completed": "green",
  "Rejected": "red",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return <Tag type={STAGE_TYPE[stage]}>{stage}</Tag>;
}