import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline" | "ai";
}

const badgeVariants = {
  default: "bg-surface-elevated text-foreground border-border",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  error: "bg-error/10 text-error border-error/25",
  info: "bg-primary-50 text-primary-700 border-primary-200",
  outline: "bg-transparent text-muted border-border",
  ai: "bg-primary-900 text-primary-200 border-primary-800",
};

const dotVariants = {
  default: "bg-muted",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-primary-600",
  outline: "bg-muted",
  ai: "bg-primary-400",
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
          badgeVariants[variant],
          className
        )}
        {...props}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotVariants[variant])} />
        <span>{children}</span>
      </div>
    );
  }
);
Badge.displayName = "Badge";

export const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const statusLower = status.toLowerCase();
  
  let variant: BadgeProps["variant"] = "default";
  
  if (["verified", "completed", "passed", "active", "approved", "success", "graded", "present"].some(s => statusLower.includes(s))) {
    variant = "success";
  } else if (["pending", "review", "in progress", "warning", "submitted", "writing", "late"].some(s => statusLower.includes(s))) {
    variant = "warning";
  } else if (["failed", "rejected", "overdue", "error", "at risk", "correction", "absent", "not submitted"].some(s => statusLower.includes(s))) {
    variant = "error";
  } else if (["info", "new", "started"].some(s => statusLower.includes(s))) {
    variant = "info";
  } else if (["ai", "generated"].some(s => statusLower.includes(s))) {
    variant = "ai";
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
};
