"use client";

import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

export function Nav({ active }: { active: "tasks" | "sales" | "files" }) {
  const links = [
    { href: "/", label: "Tasks", key: "tasks" as const },
    { href: "/sales", label: "Sale Dates", key: "sales" as const },
    { href: "/files", label: "All Files", key: "files" as const },
  ];

  return (
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
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, flexGrow: 0, color: "text.primary" }}>
            Pathway Mortgage
          </Typography>
          <div className="flex items-center gap-1 ml-auto">
            {links.map((link) => (
              <Button
                key={link.key}
                component={Link}
                href={link.href}
                variant={active === link.key ? "contained" : "text"}
                size="small"
                sx={
                  active === link.key
                    ? {
                        bgcolor: "primary.main",
                        color: "common.white",
                        "&:hover": { bgcolor: "primary.dark" },
                      }
                    : { color: "text.secondary" }
                }
              >
                {link.label}
              </Button>
            ))}
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}