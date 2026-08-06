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
import { toast } from "react-hot-toast"

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
    const trimmedNote = note.trim()

    if (task.type === "internal_red_flag" && task.assignedTo.id !== actorId) {
      toast.error("Only assigned person can close this task")
      return
    }

    if (!trimmedNote) {
      toast.error("Notes are required to complete this task")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmedNote, authorId: actorId }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        toast.error(data.error ?? "Unable to complete task")
        return
      }

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
      <Dialog
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Complete Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              required
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Called 2 times, notified that the escalation has been submitted..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={completeTask}
            disabled={saving || !note.trim()}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
