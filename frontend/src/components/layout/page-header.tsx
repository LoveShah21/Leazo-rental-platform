import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        "bg-gradient-to-br from-primary/10 via-transparent to-foreground/5",
        "dark:from-primary/15 dark:via-transparent dark:to-white/5",
        "px-6 py-10 sm:px-10 sm:py-12 mb-8",
        className
      )}
    >
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
