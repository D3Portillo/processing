"use client";

import { Container, Box } from "@mui/material";
import { Nav } from "@/app/components/Nav";
import { LiveTaskDashboard } from "@/app/components/LiveTaskDashboard";

export default function DashboardPage() {
  return (
    <Box>
      <Nav active="tasks" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LiveTaskDashboard />
      </Container>
    </Box>
  );
}