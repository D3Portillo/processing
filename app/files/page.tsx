"use client"

import { Container, Box } from "@mui/material"
import { Nav } from "@/app/components/Nav"
import { LiveFiles } from "@/app/components/LiveFiles"

export default function AllFilesPage() {
  const currentSpecialistId = "sp-1"

  return (
    <Box>
      <Nav active="files" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LiveFiles currentSpecialistId={currentSpecialistId} />
      </Container>
    </Box>
  )
}
