"use client"

import Link from "next/link"
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading } = useSalesforceUser()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error || !data?.user) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            TRG Portal. Connect to Verify
          </Typography>
          <Typography color="text.secondary">
            Connect your Google Account to continue.
          </Typography>
          <Button
            component={Link}
            href="/api/auth/google/login"
            variant="contained"
          >
            CONNECT
          </Button>
        </Box>
      </Container>
    )
  }

  return <>{children}</>
}
