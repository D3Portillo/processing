"use client"

import { useState } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material"
import { Plus, Phone } from "lucide-react"
import { toast } from "react-hot-toast"
import { createTask } from "@/app/actions/tasks"
import { useTasks } from "@/app/hooks/useTasks"
import type { Specialist } from "@/app/lib/types"

export function AddTaskDialog({
  fileId,
  specialists,
  actorId,
  assignedSpecialist,
}: {
  fileId: string
  specialists: Specialist[]
  actorId: string
  assignedSpecialist?: Specialist | null
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"custom" | "followup">("custom")
  const [followUpTarget, setFollowUpTarget] = useState<"borrower" | "lender">(
    "borrower",
  )
  const [title, setTitle] = useState("")
  const [assignTo, setAssignTo] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const { mutate } = useTasks(fileId)

  function openBlank() {
    setMode("custom")
    setTitle("")
    setDescription("")
    setDueDate("")
    // Custom tasks start unassigned so the creator must pick someone.
    setAssignTo("")
    setOpen(true)
    setAnchorEl(null)
  }

  function openFollowUp() {
    setMode("followup")
    setFollowUpTarget("borrower")
    setTitle("Borrower Follow Up")
    setDescription("")
    setDueDate("")
    // Follow-ups default to the person assigned to the file.
    setAssignTo(assignedSpecialist?.id ?? "")
    setOpen(true)
    setAnchorEl(null)
  }

  function handleFollowUpTargetChange(target: "borrower" | "lender") {
    setFollowUpTarget(target)
    setTitle(target === "borrower" ? "Borrower Follow Up" : "Lender Follow Up")
  }

  async function handleSubmit() {
    if (!title.trim()) return

    setSaving(true)
    try {
      const result = await createTask({
        fileId,
        title,
        type: "custom",
        assignedToId: assignTo,
        dueDate: dueDate || null,
        note: description.trim() || null,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Task created")
      setTitle("")
      setDescription("")
      setDueDate("")
      setAssignTo("")
      setOpen(false)
      await mutate()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Plus size={16} />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Add Task
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={openFollowUp}>
          <ListItemIcon>
            <Phone size={16} />
          </ListItemIcon>
          <ListItemText>Follow up</ListItemText>
        </MenuItem>
        <MenuItem onClick={openBlank}>
          <ListItemIcon>
            <Plus size={16} />
          </ListItemIcon>
          <ListItemText>Create Task</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {mode === "followup" ? "New Follow Up" : "New Task"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {mode === "followup" && (
              <FormControl>
                <RadioGroup
                  row
                  value={followUpTarget}
                  onChange={(event) =>
                    handleFollowUpTargetChange(
                      event.target.value as "borrower" | "lender",
                    )
                  }
                >
                  <FormControlLabel
                    value="borrower"
                    control={<Radio size="small" />}
                    label="Borrower"
                  />
                  <FormControlLabel
                    value="lender"
                    control={<Radio size="small" />}
                    label="Lender"
                  />
                </RadioGroup>
              </FormControl>
            )}
            <TextField
              label="Title"
              fullWidth
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Call lender for status update"
            />
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={assignTo}
                label="Assign To"
                onChange={(event) => setAssignTo(event.target.value)}
              >
                {specialists.map((specialist) => (
                  <MenuItem key={specialist.id} value={specialist.id}>
                    {specialist.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              required
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: new Date().toISOString().slice(0, 10) },
              }}
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!title.trim() || !dueDate || saving}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
