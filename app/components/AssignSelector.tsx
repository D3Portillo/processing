"use client";

import { useState, useEffect } from "react";
import { Box, Avatar, Select, MenuItem, FormControl, Typography } from "@mui/material";
import { getInitials } from "@/app/lib/utils";
import { assignFile, useStore } from "@/app/lib/mock-data";
import type { Specialist } from "@/app/lib/types";

const UNASSIGNED_ID = "__unassigned__";

export function AssignSelector({ fileId, current, specialists, actorId }: { fileId: string; current: Specialist | null; specialists: Specialist[]; actorId: string }) {
  useStore();
  const [value, setValue] = useState(current?.id ?? UNASSIGNED_ID);

  useEffect(() => { setValue(current?.id ?? UNASSIGNED_ID); }, [current?.id]);

  const handleChange = (e: any) => {
    const selectedId = e.target.value as string;
    setValue(selectedId);
    const specialistId = selectedId === UNASSIGNED_ID ? null : selectedId;
    assignFile(fileId, specialistId, actorId);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {current ? (
        <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: current.avatarColor }}>
          {getInitials(current.name)}
        </Avatar>
      ) : (
        <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "grey.400" }}>?</Avatar>
      )}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={value}
          onChange={handleChange}
          renderValue={(selected) => {
            if (selected === UNASSIGNED_ID) {
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Assigned to</Typography>
                  <Box component="span" sx={{ fontWeight: 600, color: "text.secondary" }}>Unassigned</Box>
                </Box>
              );
            }
            const sp = specialists.find((s) => s.id === selected) ?? current;
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Assigned to</Typography>
                <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{sp?.name}</Box>
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
          <MenuItem value={UNASSIGNED_ID}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "text.secondary" }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: "grey.400" }}>?</Avatar>
              Unassigned
            </Box>
          </MenuItem>
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