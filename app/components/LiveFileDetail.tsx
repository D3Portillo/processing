"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Alert,
  CircularProgress,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
} from "@mui/material"
import { Phone, Mail, MapPin, Clock, User } from "lucide-react"
import { useLeads } from "@/app/hooks/useLeads"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"
import { mapLeadToMortgageFile } from "@/app/lib/lead-mapper"
import { deriveLeadTasks } from "@/app/lib/lead-tasks"
import { Nav } from "@/app/components/Nav"
import { FileMenu } from "@/app/components/FileMenu"
import { LenderCard } from "@/app/components/LenderCard"
import { StageBadge } from "@/app/components/StageBadge"
import { FileTabs } from "@/app/components/FileTabs"
import { AddTaskDialog } from "@/app/components/AddTaskDialog"
import { AssignSelector } from "@/app/components/AssignSelector"
import { SALESFORCE_OWNERS } from "@/app/lib/sf-leads"
import { colorFromString, formatDate, formatRelative } from "@/app/lib/utils"
import { GeneratedTaskCheckbox } from "@/app/components/GeneratedTaskCheckbox"
import { useAtomValue } from "jotai"
import { isTaskCompleted, taskCompletionsAtom } from "@/app/lib/task-state"

export function LiveFileDetail() {
  const params = useParams<{ fileId: string }>()
  const { data: leads, error, isLoading } = useLeads()
  const { data: connectedUser } = useSalesforceUser()
  const completions = useAtomValue(taskCompletionsAtom)

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>
  }

  const lead = leads?.find((item) => item.Id === params.fileId)
  if (!lead) {
    return (
      <Alert severity="warning">
        This file was not found in the live Salesforce data.
      </Alert>
    )
  }

  const file = mapLeadToMortgageFile(lead)
  const specialists = SALESFORCE_OWNERS.map((owner) => ({
    id: owner.Id,
    name: owner.Name,
    email: owner.Email ?? "",
    avatarColor: colorFromString(owner.Id),
  }))
  const actor = specialists.find(
    (specialist) => specialist.email.toLowerCase() === connectedUser?.user?.email.toLowerCase(),
  )
  const actorId = actor?.id ?? file.specialist?.id ?? specialists[0]?.id ?? ""
  const generatedTasks = deriveLeadTasks(lead, file.specialist ?? specialists[0])
  const openTasks = generatedTasks.filter(
    (task) => !isTaskCompleted(task.id, task.status, completions),
  )
  const taskCounts = { tasks: openTasks.length, timeline: 0, notes: 0, documents: 0 }

  return (
    <Box>
      <Nav active="tasks" />
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500 }} noWrap>
              {file.borrower.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <StageBadge stage={file.stage} />
              <FileMenu
                fileId={file.id}
                currentStage={file.stage}
                actorId={actorId}
              />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <AssignSelector
              fileId={file.id}
              current={file.specialist}
              specialists={specialists}
              actorId={actorId}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mb: 4,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <User size={16} />
                <Typography variant="overline" color="text.secondary">
                  Borrower
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1 }}>
                {file.borrower.name}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone size={14} />
                  <Typography variant="body2" color="text.secondary">
                    {file.borrower.phone || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Mail size={14} />
                  <Typography variant="body2" color="text.secondary">
                    {file.borrower.email || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MapPin size={14} />
                  <Typography variant="body2" color="text.secondary">
                    Property address unavailable
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Link
                  href={`https://force-energy-1679.lightning.force.com/lightning/r/Lead/${file.id}/view`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "primary.main",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {file.borrower.loanNumber
                      ? `Loan #${file.borrower.loanNumber}`
                      : "View in Salesforce"}
                  </Typography>
                </Link>
                {file.borrower.loanType && (
                  <Chip
                    label={file.borrower.loanType}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "primary.main",
                      color: "primary.main",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <LenderCard
                lender={file.lender}
                contacts={[]}
                saleDate={file.saleDate}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <AddTaskDialog
            fileId={file.id}
            specialists={specialists}
            actorId={actorId}
          />
        </Box>
        <FileTabs counts={taskCounts}>
          <Card variant="outlined">
            <CardContent>
              {generatedTasks.map((task) => (
                <Box key={task.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                  <GeneratedTaskCheckbox task={task} actorId={actorId} />
                  <Typography sx={{ flex: 1, textDecoration: isTaskCompleted(task.id, task.status, completions) ? "line-through" : "none" }}>{task.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{task.dueDate ? formatDate(task.dueDate) : "No due date"}</Typography>
                </Box>
              ))}
              {generatedTasks.length === 0 && <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No tasks yet.</Typography>}
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                No timeline events from Salesforce yet.
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                No notes yet.
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                No documents uploaded.
              </Typography>
            </CardContent>
          </Card>
        </FileTabs>

        <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={12} />
            <Typography variant="caption" color="text.secondary">
              Created {formatDate(file.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={12} />
            <Typography variant="caption" color="text.secondary">
              Updated {formatRelative(file.updatedAt)}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
