"use client";

import { Container, Box } from "@mui/material";
import { getAllFiles, useStore } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { FileGrid } from "@/app/components/FileGrid";

export default function AllFilesPage() {
  useStore();
  const files = getAllFiles();
  const currentSpecialistId = "sp-1";

  return (
    <Box>
      <Nav active="files" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <FileGrid files={files} currentSpecialistId={currentSpecialistId} />
      </Container>
    </Box>
  );
}