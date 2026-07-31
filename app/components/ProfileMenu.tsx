"use client"

import { useState } from "react"
import { Avatar, Box, Menu, MenuItem, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { colorFromString, getInitials } from "@/app/lib/utils"
import type { GoogleIdentity } from "@/app/lib/google-auth"

export function ProfileMenu({ user }: { user: GoogleIdentity }) {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  async function disconnect() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    window.location.reload()
  }

  return (
    <>
      <Avatar
        src={user.picture}
        alt={user.name}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          width: 30,
          height: 30,
          fontSize: "0.75rem",
          bgcolor: colorFromString("ME"),
          cursor: "pointer",
        }}
      >
        {getInitials(user.name)}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <Box sx={{ px: 2, py: 1.25, minWidth: 220 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <MenuItem onClick={disconnect}>Disconnect</MenuItem>
      </Menu>
    </>
  )
}
