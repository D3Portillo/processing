"use client";

import { useState } from "react";
import { Box, Select, MenuItem, FormControl, Typography, Stack, Divider } from "@mui/material";
import { Phone, Mail, Calendar, Building, Users } from "lucide-react";
import type { Lender, LenderContact } from "@/app/lib/types";
import { formatDate, formatRelative, isOverdue } from "@/app/lib/utils";

export function LenderCard({ lender, contacts, saleDate }: { lender: Lender; contacts: LenderContact[]; saleDate: string | null }) {
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const selected = contacts.find((c) => c.id === contactId) ?? null;
  const pastSale = saleDate && isOverdue(saleDate);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Building size={16} />
        <Typography variant="overline" color="text.secondary">Lender</Typography>
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{lender.name}</Typography>

      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 2, mb: 1 }}>Point of Contact</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", mb: 0.25 }}>
        <Users size={16} />
        <FormControl size="small" sx={{ minWidth: 140, ml: 0, "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" } }}>
          <Select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              const contact = contacts.find((c) => c.id === selected);
              if (!contact) return <Typography variant="body2" color="text.secondary">Not assigned</Typography>;
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{contact.department}</Typography>
                  {contact.name && <Typography variant="caption" color="text.secondary">{contact.name}</Typography>}
                </Box>
              );
            }}
            sx={{ "& .MuiSelect-select": { py: 0.5, px: 1, fontSize: "0.8rem" } }}
          >
            {contacts.length === 0 ? (
              <MenuItem disabled value="">No contacts available</MenuItem>
            ) : (
              contacts.map((contact) => (
                <MenuItem key={contact.id} value={contact.id}>
                  <Box>
                    <Typography variant="body2">{contact.department}</Typography>
                    {contact.name && <Typography variant="caption" color="text.secondary">{contact.name}</Typography>}
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
        <Calendar size={16} strokeWidth={2} />
        <Box>
          <Typography variant="caption" color="text.secondary">Sale Date</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {saleDate ? formatDate(saleDate) : "N/A"}
            </Typography>
            {pastSale && (
              <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
                ({formatRelative(saleDate)})
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}