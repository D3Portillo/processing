"use client"

import { useState } from "react"
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material"
import { useTasks } from "@/app/hooks/useTasks"
import type { Task } from "@/app/lib/types"

export function GeneratedTaskCheckbox({
  task,
  actorId,
}: {
  task: Task
  actorId: string
}) {
  const { mutate } = useTasks(task.fileId)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const completed = task.status === "Completed"

  async function completeTask() {
    setSaving(true)
    try {
      await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || null, authorId: actorId }),
      })
      await mutate()
    } finally {
      setSaving(false)
      setNoteOpen(false)
      setNote("")
    }
  }

  return (
    <>
      <Checkbox
        checked={completed}
        size="small"
        disabled={completed || saving}
        onClick={(event) => event.stopPropagation()}
        onChange={() => setNoteOpen(true)}
        sx={{ p: 0.5 }}
      />
      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Complete Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="What happened?"
              fullWidth
              multiline
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Called lender — awaiting updated payoff quote."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={completeTask} disabled={saving}>
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
