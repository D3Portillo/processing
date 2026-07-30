"use client";

import { useState } from "react";
import { Box, Avatar, Select, MenuItem, FormControl, Typography } from "@mui/material";
import { getInitials } from "@/app/lib/utils";
import type { Specialist } from "@/app/lib/types";

export function AssignSelector({ current, specialists }: { current: Specialist; specialists: Specialist[] }) {
  const [value, setValue] = useState(current.id);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: current.avatarColor }}>
        {getInitials(current.name)}
      </Avatar>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          renderValue={(selected) => {
            const sp = specialists.find((s) => s.id === selected) ?? current;
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Assigned to</Typography>
                <Box component="span" fontWeight={600} sx={{ color: "text.primary" }}>{sp.name}</Box>
              </Box>
            );
          }}
          sx={{
            "& .MuiSelect-select": { py: 0.75, px: 1.5 },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
          }}
        >
          {specialists.map((sp) => (
            <MenuItem key={sp.id} value={sp.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: sp.avatarColor }}>
                  {getInitials(sp.name)}
                </Avatar>
                {sp.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}