"use client";

import { useState, useTransition } from "react";
import { Button, TextArea, Form, Stack } from "@carbon/react";
import { Add } from "@carbon/icons-react";
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
      setBody("");
      setExpanded(false);
    });
  }

  if (!expanded) {
    return (
      <Button kind="ghost" size="sm" renderIcon={Add} onClick={() => setExpanded(true)}>
        Add Note
      </Button>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Stack gap={3}>
        <TextArea
          id="note-body"
          labelText="New Note"
          placeholder="Enter your note..."
          rows={3}
          value={body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button kind="secondary" size="sm" onClick={() => { setExpanded(false); setBody(""); }}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={transitioning || !body.trim()}>
            {transitioning ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </Stack>
    </Form>
  );
}