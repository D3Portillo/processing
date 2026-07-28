"use client";

import { useState, useTransition } from "react";
import { Button, TextField, Stack } from "@mui/material";
import { Plus } from "lucide-react";
import { addNoteAction } from "@/app/lib/actions";

export function AddNoteForm({ fileId, authorId }: { fileId: string; authorId: string }) {
  const [transitioning, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      await addNoteAction({ fileId, authorId, body: body.trim() });
      setBody(""); setExpanded(false);
    });
  }

  if (!expanded) {
    return <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={() => setExpanded(true)}>Add Note</Button>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField label="New Note" multiline rows={3} fullWidth value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Enter your note..." autoFocus />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => { setExpanded(false); setBody(""); }}>Cancel</Button>
          <Button type="submit" variant="contained" size="small" disabled={transitioning || !body.trim()}>
            {transitioning ? "Saving..." : "Save Note"}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}