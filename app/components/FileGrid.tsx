"use client"

import { useState, useMemo } from "react"
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
import { SALESFORCE_OWNERS } from "@/app/lib/sf-leads"

const ALL_PEOPLE = "all"
const UNASSIGNED = "unassigned"

export function FileGrid({
  files,
  currentSpecialistId,
}: {
  files: MortgageFile[]
  currentSpecialistId: string
}) {
  const { totalLeads } = useLeads()
  const [query, setQuery] = useState("")
  const [ownerId, setOwnerId] = useState(currentSpecialistId)

  const filtered = useMemo(() => {
    let result = files

    if (ownerId === UNASSIGNED) {
      result = result.filter((f) => !f.specialist)
    } else if (ownerId !== ALL_PEOPLE) {
      result = result.filter((f) => f.specialist?.id === ownerId)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (f) =>
          f.borrower.name.toLowerCase().includes(q) ||
          f.lender.name.toLowerCase().includes(q) ||
          f.borrower.propertyAddress.toLowerCase().includes(q) ||
          f.borrower.loanNumber.toLowerCase().includes(q),
      )
    }

    return result
  }, [files, query, ownerId])

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder={`Search in all files ${totalLeads > 0 ? `(${totalLeads})` : ""}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
            onChange={(e) => setOwnerId(e.target.value)}
            renderValue={(selected) => {
              const selectedOwner = SALESFORCE_OWNERS.find(
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
            {SALESFORCE_OWNERS.filter(
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
