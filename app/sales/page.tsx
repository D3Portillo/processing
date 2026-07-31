"use client";

import { Container, Typography, Box } from "@mui/material";
import { Nav } from "@/app/components/Nav";
import { LiveSales } from "@/app/components/LiveSales";

export default function SalesPage() {
  return (
    <Box>
      <Nav active="sales" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>Upcoming Sale Dates (14 days)</Typography>
        </Box>
        <LiveSales />
      </Container>
    </Box>
  );
}