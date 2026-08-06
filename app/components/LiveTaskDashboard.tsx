"use client"

import { Alert, CircularProgress, Box } from "@mui/material"
import { useLeads } from "@/app/hooks/useLeads"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"
import { mapLeadToMortgageFile } from "@/app/lib/lead-mapper"
import { useTasks } from "@/app/hooks/useTasks"
import { PROCESSING_TEAM } from "@/app/lib/owners"
import { TaskList } from "@/app/components/TaskList"
import type { Task } from "@/app/lib/types"

export function LiveTaskDashboard() {
  const { data: leads, error, isLoading } = useLeads()
  const { data: connectedUser } = useSalesforceUser()
  const { data: taskRows, isLoading: tasksLoading, error: terror } = useTasks()

  if (isLoading || tasksLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  if (error) return <Alert severity="error">{error.message}</Alert>

  const owners = PROCESSING_TEAM.map((owner) => ({
    id: owner.Id,
    name: owner.Name,
    email: owner.Email ?? "",
    avatarColor: "#64748b",
  }))
  const ownerMap = new Map(owners.map((o) => [o.id, o]))
  const fallbackOwner = owners[0]

  const tasks: Task[] = (taskRows ?? []).map((row) => ({
    id: row.id,
    fileId: row.file_id,
    title: row.title,
    description: row.note,
    type: row.type,
    assignedTo: ownerMap.get(row.assigned_to) ?? fallbackOwner,
    dueDate: row.due_date,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }))
  const files = (leads ?? []).map(mapLeadToMortgageFile)
  const fileMap = new Map(files.map((file) => [file.id, file]))
  const currentOwner = owners.find(
    (owner) => owner.email === connectedUser?.user?.email,
  )

  return (
    <TaskList
      tasks={tasks}
      fileMap={fileMap}
      currentSpecialistId={currentOwner?.id ?? ""}
    />
  )
}
