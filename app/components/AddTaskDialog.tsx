"use client";

import { useState, useTransition } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select, Stack,
} from "@mui/material";
import { Plus } from "lucide-react";
import type { Specialist, TaskPriority } from "@/app/lib/types";
import { createTaskAction } from "@/app/lib/actions";

export function AddTaskDialog({ fileId, specialists, actorId }: { fileId: string; specialists: Specialist[]; actorId: string }) {
  const [open, setOpen] = useState(false);
  const [transitioning, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [assignTo, setAssignTo] = useState(specialists[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createTaskAction({
        fileId, title: title.trim(), description: description.trim() || undefined,
        assignedToId: assignTo, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        priority, actorId,
      });
      setTitle(""); setDescription(""); setDueDate(""); setPriority("Medium");
      setOpen(false);
    });
  }

  return (
    <>
      <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
        Add Task
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call lender for status update" />
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select value={assignTo} label="Assign To" onChange={(e) => setAssignTo(e.target.value)}>
                {specialists.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Due Date" type="date" fullWidth value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Description (optional)" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={transitioning || !title.trim()}>
            {transitioning ? "Creating..." : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}