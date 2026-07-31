"use client"

import { useState } from "react"
import { Avatar, Menu, MenuItem } from "@mui/material"
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
          bgcolor: colorFromString(user.email),
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
        <MenuItem onClick={disconnect}>Disconnect</MenuItem>
      </Menu>
    </>
  )
}