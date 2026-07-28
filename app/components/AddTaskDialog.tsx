"use client";

import { useState, useTransition } from "react";
import {
  Modal,
  TextInput,
  TextArea,
  Dropdown,
  Button,
  Form,
  Stack,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await createTaskAction({
        fileId,
        title: title.trim(),
        description: description.trim() || undefined,
        assignedToId: assignTo,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        priority,
        actorId,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");
      setOpen(false);
    });
  }

  const priorityItems = [
    { id: "High", label: "High" },
    { id: "Medium", label: "Medium" },
    { id: "Low", label: "Low" },
  ];
  const specialistItems = specialists.map((s) => ({ id: s.id, label: s.name }));

  return (
    <>
      <Button
        kind="ghost"
        size="sm"
        renderIcon={Add}
        onClick={() => setOpen(true)}
      >
        Add Task
      </Button>
      <Modal
        open={open}
        onRequestClose={() => setOpen(false)}
        modalHeading="New Task"
        primaryButtonText="Create Task"
        secondaryButtonText="Cancel"
        onSecondarySubmit={() => setOpen(false)}
        onRequestSubmit={handleSubmit}
        primaryButtonDisabled={transitioning || !title.trim()}
      >
        <Form>
          <Stack gap={5}>
            <TextInput
              id="task-title"
              labelText="Title"
              placeholder="e.g. Call lender for status update"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
            <Dropdown
              id="task-assign"
              labelText="Assign To"
              items={specialistItems}
              selectedItem={specialistItems.find((s) => s.id === assignTo) ?? specialistItems[0]}
              onChange={(e: { selectedItem: { id: string } }) => setAssignTo(e.selectedItem.id)}
            />
            <TextInput
              id="task-due"
              labelText="Due Date"
              type="date"
              value={dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
            />
            <Dropdown
              id="task-priority"
              labelText="Priority"
              items={priorityItems}
              selectedItem={priorityItems.find((p) => p.id === priority) ?? priorityItems[1]}
              onChange={(e: { selectedItem: { id: string } }) => setPriority(e.selectedItem.id as TaskPriority)}
            />
            <TextArea
              id="task-desc"
              labelText="Description (optional)"
              rows={2}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
          </Stack>
        </Form>
      </Modal>
    </>
  );
}