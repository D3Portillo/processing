"use client";

import { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select,
  Menu, ListItemIcon, ListItemText, Stack,
} from "@mui/material";
import { Plus, Phone } from "lucide-react";
import type { Specialist } from "@/app/lib/types";
import { createTask, useStore } from "@/app/lib/mock-data";

export function AddTaskDialog({ fileId, specialists, actorId }: { fileId: string; specialists: Specialist[]; actorId: string }) {
  useStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignTo, setAssignTo] = useState(specialists[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  function openBlank() {
    setTitle(""); setDescription(""); setDueDate("");
    setOpen(true);
    setAnchorEl(null);
  }

  function openFollowUp() {
    setTitle("Follow up");
    setOpen(true);
    setAnchorEl(null);
  }

  function handleSubmit() {
    if (!title.trim()) return;
    createTask({
      fileId, title: title.trim(), description: description.trim() || undefined,
      assignedToId: assignTo, dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      actorId,
    });
    setTitle(""); setDescription(""); setDueDate("");
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Plus size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Add Task
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={openFollowUp}>
          <ListItemIcon><Phone size={16} /></ListItemIcon>
          <ListItemText>Follow up</ListItemText>
        </MenuItem>
        <MenuItem onClick={openBlank}>
          <ListItemIcon><Plus size={16} /></ListItemIcon>
          <ListItemText>Create Task</ListItemText>
        </MenuItem>
      </Menu>
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
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Description (optional)" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!title.trim()}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}