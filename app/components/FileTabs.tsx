"use client"

import { useState } from "react"
import {
  Box,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
} from "@mui/material"

export function FileTabs({
  counts,
  action,
  children,
}: {
  counts: {
    tasks: number
    timeline: number
    notes: number
    documents: number
    emails: number
    sms: number
  }
  action?: React.ReactNode
  children: [
    React.ReactNode,
    React.ReactNode,
    React.ReactNode,
    React.ReactNode,
    React.ReactNode,
    React.ReactNode,
  ]
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [view, setView] = useState("tasks")

  const tabs = [
    { key: "tasks", label: `Tasks (${counts.tasks})`, child: children[0] },
    { key: "notes", label: `Notes (${counts.notes})`, child: children[1] },
    {
      key: "documents",
      label: `Documents (${counts.documents})`,
      child: children[2],
    },
    { key: "email", label: `Email (${counts.emails})`, child: children[3] },
    { key: "sms", label: `SMS (${counts.sms})`, child: children[4] },
    {
      key: "timeline",
      label: `Timeline (${counts.timeline})`,
      child: children[5],
    },
  ]

  // Tabs shown in the tab strip.
  const visibleTabs = isMobile
    ? tabs.filter((t) => t.key === "tasks")
    : tabs.filter((t) =>
        ["tasks", "notes", "documents", "email"].includes(t.key),
      )

  // Options in the "Manage Tabs" dropdown, in the desired display order.
  const dropdownKeys = isMobile
    ? ["documents", "timeline", "notes", "email", "sms"]
    : ["timeline", "sms"]
  const dropdownTabs = dropdownKeys
    .map((key) => tabs.find((t) => t.key === key))
    .filter((t): t is (typeof tabs)[number] => Boolean(t))

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
        }}
      >
        <Tabs value={view} onChange={(_, v) => setView(v)}>
          {visibleTabs.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            {action}
          </Box>
        )}
        <FormControl
          size="small"
          sx={{ minWidth: 130, ml: isMobile ? "auto" : 0 }}
        >
          <Select
            value={dropdownTabs.some((t) => t.key === view) ? view : ""}
            displayEmpty
            renderValue={(selected) => {
              const t = tabs.find((x) => x.key === selected)
              return t ? t.label : "Manage Tabs"
            }}
            onChange={(event) => setView(event.target.value)}
            sx={{ height: 32 }}
          >
            {dropdownTabs.map((t) => (
              <MenuItem key={t.key} value={t.key}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {tabs.map((t) => (
        <Box key={t.key} sx={{ display: view === t.key ? "block" : "none" }}>
          {t.key === "tasks" && isMobile && action && (
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
            >
              {action}
            </Box>
          )}
          {t.child}
        </Box>
      ))}
    </>
  )
}
