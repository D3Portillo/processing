"use client"

import { useEffect, useRef } from "react"
import { Alert, CircularProgress, Box } from "@mui/material"
import { useLeads } from "@/app/hooks/useLeads"
import { mapLeadToMortgageFile } from "@/app/lib/lead-mapper"
import { FileGrid } from "./FileGrid"

export function LiveFiles({
  currentSpecialistId,
}: {
  currentSpecialistId: string
}) {
  const { leads, error, isLoading, hasMore, loadMore } = useLeads()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: "600px" },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>
  }

  return (
    <>
      <FileGrid
        files={leads.map(mapLeadToMortgageFile)}
        currentSpecialistId={currentSpecialistId}
      />
      <Box
        ref={sentinelRef}
        sx={{ display: "flex", justifyContent: "center", minHeight: 48, py: 2 }}
      />
    </>
  )
}
