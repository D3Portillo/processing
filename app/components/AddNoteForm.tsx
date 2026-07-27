"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
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
      setBody("");
      setExpanded(false);
    });
  }

  if (!expanded) {
    return (
      <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
        <Plus className="size-4" /> Add Note
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="note-body">New Note</Label>
        <Textarea
          id="note-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter your note..."
          rows={3}
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => { setExpanded(false); setBody(""); }}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={transitioning || !body.trim()}>
          {transitioning ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </form>
  );
}