"use client";

import Link from "next/link";
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
} from "@carbon/react";

export function Nav({ active }: { active: "tasks" | "sales" | "files" }) {
  const links = [
    { href: "/", label: "Tasks", key: "tasks" as const },
    { href: "/sales", label: "Sale Dates", key: "sales" as const },
    { href: "/files", label: "All Files", key: "files" as const },
  ];

  return (
    <Header aria-label="Pathway Mortgage Operations Portal">
      <HeaderName href="/">Pathway Mortgage</HeaderName>
      <HeaderNavigation aria-label="Main navigation">
        {links.map((link) => (
          <HeaderMenuItem
            key={link.key}
            href={link.href}
            isCurrentPage={active === link.key}
          >
            {link.label}
          </HeaderMenuItem>
        ))}
      </HeaderNavigation>
    </Header>
  );
}