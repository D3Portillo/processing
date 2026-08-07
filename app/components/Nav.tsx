"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
} from "@mui/material"
import { Search } from "lucide-react"
import { SearchDialog } from "./SearchDialog"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"
import { ProfileMenu } from "./ProfileMenu"
import Logo from "./Logo"

export function Nav({
  active,
}: {
  active: "tasks" | "sales" | "files" | "people"
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { data } = useSalesforceUser()

  const links = [
    { href: "/", label: "Tasks", key: "tasks" as const },
    { href: "/files", label: "Files", key: "files" as const },
    {
      href: "/sales",
      label: "Sales",
      key: "sales" as const,
      desktopOnly: true,
    },
  ]

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Logo className="w-15" />
            </Link>
            <Box
              sx={{ display: "flex", gap: 2, ml: "auto", alignItems: "center" }}
            >
              {links.map((link) => (
                <Box
                  key={link.key}
                  sx={{
                    ...(link.desktopOnly && {
                      display: { xs: "none", md: "block" },
                    }),
                  }}
                >
                  <Link href={link.href} style={{ textDecoration: "none" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        pb: 0.5,
                        borderBottom: active === link.key ? 2 : 0,
                        borderColor: "primary.main",
                        color:
                          active === link.key
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: active === link.key ? 600 : 400,
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {link.label}
                    </Typography>
                  </Link>
                </Box>
              ))}
              <IconButton
                size="small"
                onClick={() => setSearchOpen(true)}
                sx={{ color: "text.secondary", ml: 1 }}
              >
                <Search size={18} />
              </IconButton>
              {data?.user ? (
                <ProfileMenu user={data.user} />
              ) : (
                <Link
                  href="/api/auth/google/login"
                  style={{ textDecoration: "none" }}
                >
                  <Typography variant="caption" color="primary.main" noWrap>
                    Sign in with Google
                  </Typography>
                </Link>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
