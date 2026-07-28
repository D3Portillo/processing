import Link from "next/link";

export function Nav({ active }: { active: "tasks" | "sales" | "files" }) {
  const links = [
    { href: "/", label: "Tasks", key: "tasks" as const },
    { href: "/sales", label: "Sale Dates", key: "sales" as const },
    { href: "/files", label: "All Files", key: "files" as const },
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Pathway Mortgage</h1>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active === link.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}