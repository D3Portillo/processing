"use client"

import { Alert, CircularProgress, Box, Card, CardContent, Typography } from "@mui/material"
import { useMemo } from "react"
import { useLeads } from "@/app/hooks/useLeads"
import { mapLeadToMortgageFile } from "@/app/lib/lead-mapper"
import { SaleDateCard } from "@/app/components/FileCard"

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000

export function LiveSales() {
  const { data: leads, error, isLoading } = useLeads()
  const upcomingFiles = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = today.getTime()
    return (leads ?? [])
      .map(mapLeadToMortgageFile)
      .filter((file) => {
        if (!file.saleDate) return false
        const saleTime = new Date(file.saleDate).getTime()
        return saleTime >= now && saleTime <= now + FOURTEEN_DAYS
      })
      .sort((a, b) => new Date(a.saleDate ?? 0).getTime() - new Date(b.saleDate ?? 0).getTime())
  }, [leads])

  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>
  }

  if (upcomingFiles.length === 0) {
    return <Card variant="outlined"><CardContent><Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No upcoming sale dates</Typography></CardContent></Card>
  }

  return <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>{upcomingFiles.map((file) => <SaleDateCard key={file.id} file={file} />)}</Box>
}