"use client";

import { Container, Box } from "@mui/material";
import { getDashboardData, getAllFiles, useStore } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { TaskList } from "@/app/components/TaskList";

export default function DashboardPage() {
  useStore();
  const data = getDashboardData();
  const allFiles = getAllFiles();
  const fileMap = new Map(allFiles.map((f) => [f.id, f]));

  const currentSpecialistId = "sp-1";

  return (
    <Box>
      <Nav active="tasks" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <TaskList tasks={data.allOpenTasks} fileMap={fileMap} currentSpecialistId={currentSpecialistId} />
      </Container>
    </Box>
  );
}