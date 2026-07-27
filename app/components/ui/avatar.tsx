import * as React from "react";
import { cn } from "@/app/lib/utils";

function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar };