"use client";

import { useState } from "react";
import { Button, TextField, Stack } from "@mui/material";
import { Plus } from "lucide-react";
import { addNote, useStore } from "@/app/lib/ui-actions";

export function AddNoteForm({ fileId, authorId }: { fileId: string; authorId: string }) {
  useStore();
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    addNote({ fileId, authorId, body: body.trim() });
    setBody(""); setExpanded(false);
  }

  if (!expanded) {
    return <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={() => setExpanded(true)}>Add Note</Button>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField label="New Note" multiline rows={3} fullWidth value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Enter your note..." autoFocus />
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button variant="outlined" size="small" onClick={() => { setExpanded(false); setBody(""); }}>Cancel</Button>
          <Button type="submit" variant="contained" size="small" disabled={!body.trim()}>
            Save Note
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}