"use client"

import { useDeferredValue, useMemo } from "react"
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  Typography,
} from "@mui/material"
import { Search } from "lucide-react"
import type { MortgageFile } from "@/app/lib/types"
import { FileCard } from "./FileCard"
import { useLeads } from "@/hooks/useLeads"
import { colorFromString, getInitials } from "@/app/lib/utils"
import { ALL_USERS } from "@/app/lib/owners"
import { useAtom } from "jotai"
import { fileFiltersAtom } from "@/app/lib/task-state"

const ALL_PEOPLE = "all"
const UNASSIGNED = "unassigned"

export function FileGrid({
  files,
  currentSpecialistId,
  visibleCount,
}: {
  files: MortgageFile[]
  currentSpecialistId: string
  visibleCount: number
}) {
  const { totalLeads } = useLeads()
  const [filters, setFilters] = useAtom(fileFiltersAtom)
  const query = filters.query
  const ownerId = filters.ownerId || currentSpecialistId
  const deferredQuery = useDeferredValue(query)
  const isSearching = deferredQuery.trim().length > 0

  const nextFiltered = useMemo(() => {
    let result = files
    const filterOwnerId = isSearching ? ALL_PEOPLE : ownerId

    if (filterOwnerId === UNASSIGNED) {
      result = result.filter((f) => !f.specialist)
    } else if (filterOwnerId !== ALL_PEOPLE) {
      result = result.filter((f) => f.specialist?.id === filterOwnerId)
    }

    if (deferredQuery.trim()) {
      const q = deferredQuery.toLowerCase()
      result = result.filter(
        (f) =>
          f.borrower.name.toLowerCase().includes(q) ||
          f.lender.name.toLowerCase().includes(q) ||
          f.borrower.propertyAddress.toLowerCase().includes(q) ||
          f.borrower.loanNumber.toLowerCase().includes(q),
      )
    }

    return result.slice(0, isSearching ? 100 : visibleCount)
  }, [files, deferredQuery, ownerId, isSearching, visibleCount])
  const filtered = useDeferredValue(nextFiltered)

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder={`Search in all files ${totalLeads > 0 ? `(${totalLeads})` : ""}`}
          value={query}
          onChange={(e) => setFilters((current) => ({ ...current, query: e.target.value }))}
          sx={{ flexGrow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select
            value={ownerId || ALL_PEOPLE}
            onChange={(e) => setFilters((current) => ({ ...current, ownerId: e.target.value }))}
            renderValue={(selected) => {
              const selectedOwner = ALL_USERS.find(
                (item) => item.Id === selected,
              )
              const label =
                selectedOwner?.Name ??
                (selected === UNASSIGNED ? "Unassigned" : "Everyone")
              const avatarColor = selectedOwner
                ? colorFromString(selectedOwner.Id)
                : selected === UNASSIGNED
                  ? "grey.400"
                  : "primary.main"

              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.6rem",
                      bgcolor: avatarColor,
                    }}
                  >
                    {selectedOwner
                      ? getInitials(
                          selected === currentSpecialistId
                            ? "Me"
                            : selectedOwner.Name,
                        )
                      : getInitials(label)}
                  </Avatar>
                  <Typography variant="body2">
                    {selected === currentSpecialistId ? "Me" : label}
                  </Typography>
                </Box>
              )
            }}
          >
            <MenuItem value={currentSpecialistId || ALL_PEOPLE}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  mr: 1,
                  fontSize: "0.6rem",
                  bgcolor: colorFromString(currentSpecialistId),
                }}
              >
                {getInitials("Me")}
              </Avatar>
              Me
            </MenuItem>
            {ALL_USERS.filter(
              (owner) => owner.Id !== currentSpecialistId,
            ).map((owner) => (
              <MenuItem key={owner.Id} value={owner.Id}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 1,
                    fontSize: "0.6rem",
                    bgcolor: colorFromString(owner.Id),
                  }}
                >
                  {getInitials(owner.Name)}
                </Avatar>
                {owner.Name}
              </MenuItem>
            ))}
            <MenuItem value={UNASSIGNED}>Unassigned</MenuItem>
            <MenuItem value={ALL_PEOPLE}>Everyone</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {filtered.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </Box>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          No files match your search
        </Box>
      )}
    </Box>
  )
}
