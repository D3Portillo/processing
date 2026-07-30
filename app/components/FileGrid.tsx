"use client";

import { useState, useMemo } from "react";
import { Box, TextField, FormControl, Select, MenuItem, InputAdornment } from "@mui/material";
import { Search } from "lucide-react";
import type { MortgageFile } from "@/app/lib/types";
import { FileCard } from "./FileCard";

type ScopeOption = "mine" | "unassigned" | "all";

export function FileGrid({ files, currentSpecialistId }: { files: MortgageFile[]; currentSpecialistId: string }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeOption>("mine");

  const filtered = useMemo(() => {
    let result = files;

    if (scope === "mine") {
      result = result.filter((f) => f.specialist?.id === currentSpecialistId);
    } else if (scope === "unassigned") {
      result = result.filter((f) => !f.specialist);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (f) =>
          f.borrower.name.toLowerCase().includes(q) ||
          f.lender.name.toLowerCase().includes(q) ||
          f.borrower.propertyAddress.toLowerCase().includes(q) ||
          f.borrower.loanNumber.toLowerCase().includes(q)
      );
    }

    return result;
  }, [files, query, scope]);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search files..."
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
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            value={scope}
            onChange={(e) => setScope(e.target.value as ScopeOption)}
          >
            <MenuItem value="mine">Assigned to Me</MenuItem>
            <MenuItem value="unassigned">Unassigned</MenuItem>
            <MenuItem value="all">All Files</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
        {filtered.map((file) => <FileCard key={file.id} file={file} />)}
      </Box>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
          No files match your search
        </Box>
      )}
    </Box>
  );
}