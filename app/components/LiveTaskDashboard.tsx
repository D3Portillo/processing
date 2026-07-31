"use client"

import { Alert, CircularProgress, Box } from "@mui/material"
import { useLeads } from "@/app/hooks/useLeads"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"
import { mapLeadToMortgageFile } from "@/app/lib/lead-mapper"
import { deriveLeadTasks } from "@/app/lib/lead-tasks"
import { SALESFORCE_OWNERS } from "@/app/lib/sf-leads"
import { TaskList } from "@/app/components/TaskList"

export function LiveTaskDashboard() {
  const { data: leads, error, isLoading } = useLeads()
  const { data: connectedUser } = useSalesforceUser()

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error.message}</Alert>

  const owners = SALESFORCE_OWNERS.map((owner) => ({
    id: owner.Id,
    name: owner.Name,
    email: owner.Email ?? "",
    avatarColor: "#64748b",
  }))
  const fallbackOwner = owners[0]
  const tasks = (leads ?? []).flatMap((lead) => {
    const owner = owners.find((item) => item.id === lead.OwnerId) ?? fallbackOwner
    return owner ? deriveLeadTasks(lead, owner) : []
  })
  const files = (leads ?? []).map(mapLeadToMortgageFile)
  const fileMap = new Map(files.map((file) => [file.id, file]))
  const currentOwner = owners.find((owner) => owner.email === connectedUser?.user?.email)

  return <TaskList tasks={tasks} fileMap={fileMap} currentSpecialistId={currentOwner?.id ?? ""} />
}