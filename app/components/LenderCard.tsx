"use client";

import { useState } from "react";
import { Box, Select, MenuItem, FormControl, Typography, Stack, Divider } from "@mui/material";
import { Phone, Mail, Calendar, Building, User } from "lucide-react";
import type { Lender, LenderPOC } from "@/app/lib/types";
import { formatDate, formatRelative, isOverdue } from "@/app/lib/utils";

export function LenderCard({ lender, pocs, saleDate }: { lender: Lender; pocs: LenderPOC[]; saleDate: string | null }) {
  const [pocId, setPocId] = useState(pocs[0]?.id ?? "");
  const selected = pocs.find((p) => p.id === pocId) ?? null;
  const overdue = saleDate && isOverdue(saleDate);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Building size={16} />
        <Typography variant="overline" color="text.secondary">Lender</Typography>
      </Box>
      <Typography variant="subtitle1" fontWeight={600}>{lender.name}</Typography>

      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 2, mb: 1 }}>Point of Contact</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", mb: 0.25 }}>
        <User size={16} />
        <FormControl size="small" sx={{ minWidth: 140, ml: 0, "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" } }}>
          <Select
            value={pocId}
            onChange={(e) => setPocId(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              const poc = pocs.find((p) => p.id === selected);
              if (!poc) return <Typography variant="body2" color="text.secondary">Not assigned</Typography>;
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography variant="body2" fontWeight={600}>{poc.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{poc.title}</Typography>
                </Box>
              );
            }}
            sx={{ "& .MuiSelect-select": { py: 0.5, px: 1, fontSize: "0.8rem" } }}
          >
            {pocs.length === 0 ? (
              <MenuItem disabled value="">No contacts available</MenuItem>
            ) : (
              pocs.map((poc) => (
                <MenuItem key={poc.id} value={poc.id}>
                  <Box>
                    <Typography variant="body2">{poc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{poc.title}</Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>
      {selected && (
        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Phone size={14} />
            <Typography variant="body2" color="text.secondary">{selected.phone}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Mail size={14} />
            <Typography variant="body2" color="text.secondary" noWrap>{selected.email}</Typography>
          </Box>
        </Stack>
      )}

      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Calendar size={16} strokeWidth={2} style={{ color: overdue ? "#d32f2f" : "inherit" }} />
        <Box>
          <Typography variant="caption" color="text.secondary">Sale Date</Typography>
          <Typography variant="body2" fontWeight={600} color={overdue ? "error" : "text.primary"}>
            {saleDate ? `${formatDate(saleDate)} (${formatRelative(saleDate)})` : "N/A"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}