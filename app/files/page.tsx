"use client"

import { Container, Box } from "@mui/material"
import { Nav } from "@/app/components/Nav"
import { LiveFiles } from "@/app/components/LiveFiles"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"
import { ALL_USERS } from "@/app/lib/owners"

export default function AllFilesPage() {
  const { data } = useSalesforceUser()
  const currentSpecialistId =
    ALL_USERS.find(
      (owner) => owner.Email?.toLowerCase() === data?.user?.email.toLowerCase(),
    )?.Id ?? ""

  return (
    <Box>
      <Nav active="files" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LiveFiles currentSpecialistId={currentSpecialistId} />
      </Container>
    </Box>
  )
}
