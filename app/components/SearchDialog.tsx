"use client";

import { useState } from "react";
import { Dialog, DialogContent, TextField, InputAdornment, Box, Typography } from "@mui/material";
import { Search, X } from "lucide-react";
import { IconButton } from "@mui/material";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", m: 0, width: "90%", maxWidth: 560 } } }}>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Search size={20} style={{ color: "text.secondary" }} />
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            placeholder="Search people, files, lenders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{ input: { disableUnderline: true, sx: { fontSize: "1rem" } } }}
          />
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Box>
        {query.trim() && (
          <Box sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Searching for "{query}"...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Results will appear here
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}