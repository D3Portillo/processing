import owners from "@/data/salesforce-owners.json"

export interface SalesforceOwner {
  Id: string
  Name: string
  isProcessingTeamMember?: boolean
  Email: string | null
  AvatarUrl?: string | null
}

// Derived from the static owners JSON — no DB/Salesforce dependency, so this
// module is safe to import from client components.
export const ALL_USERS = (owners as SalesforceOwner[]).filter((o) =>
  o.Email?.includes("retentiongroup.org"),
)

export const PROCESSING_TEAM = ALL_USERS.filter((o) => o.isProcessingTeamMember)
