"use client";

import { Container, Typography, Box, Card, CardContent } from "@mui/material";
import { getDashboardData, useStore } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { SaleDateCard } from "@/app/components/FileCard";

export default function SalesPage() {
  useStore();
  const data = getDashboardData();

  return (
    <Box>
      <Nav active="sales" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>Upcoming Sale Dates (14 days)</Typography>
        </Box>
        {data.upcomingSaleDates.length === 0 ? (
          <Card variant="outlined"><CardContent><Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No upcoming sale dates</Typography></CardContent></Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {data.upcomingSaleDates.map((file) => <SaleDateCard key={file.id} file={file} />)}
          </Box>
        )}
      </Container>
    </Box>
  );
}