"use client";

import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

export function FileTabs({
  counts,
  children,
}: {
  counts: { tasks: number; timeline: number; notes: number; documents: number };
  children: [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode];
}) {
  const [tab, setTab] = useState(0);
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Tasks (${counts.tasks})`} />
          <Tab label={`Timeline (${counts.timeline})`} />
          <Tab label={`Notes (${counts.notes})`} />
          <Tab label={`Documents (${counts.documents})`} />
        </Tabs>
      </Box>
      <Box sx={{ display: tab === 0 ? "block" : "none" }}>{children[0]}</Box>
      <Box sx={{ display: tab === 1 ? "block" : "none" }}>{children[1]}</Box>
      <Box sx={{ display: tab === 2 ? "block" : "none" }}>{children[2]}</Box>
      <Box sx={{ display: tab === 3 ? "block" : "none" }}>{children[3]}</Box>
    </>
  );
}