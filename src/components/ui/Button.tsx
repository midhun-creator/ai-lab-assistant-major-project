import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

const variantStyles = {
  primary:
    "bg-foreground text-surface hover:bg-primary-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] font-medium border border-foreground",
  secondary:
    "bg-surface-elevated text-foreground hover:bg-border/60 font-medium border border-border",
  outline:
    "bg-surface border border-border text-foreground hover:bg-surface-elevated font-medium shadow-subtle",
  ghost:
    "text-muted hover:text-foreground hover:bg-surface-elevated font-medium border border-transparent",
  destructive:
    "bg-error text-white hover:opacity-95 font-medium border border-error shadow-subtle",
  success:
    "bg-success text-white hover:opacity-95 font-medium border border-success shadow-subtle",
};

const sizeStyles = {
  sm: "px-2.5 py-1.5 text-xs rounded-md gap-1.5",
  md: "px-3.5 py-2 text-sm rounded-md gap-2",
  lg: "px-5 py-2.5 text-sm rounded-lg gap-2",
  icon: "p-2 rounded-md flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-fast disabled:opacity-45 disabled:cursor-not-allowed active:translate-y-[0.5px]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
