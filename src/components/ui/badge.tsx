import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-gray-150 text-gray-550 border border-gray-250",
        primary: "bg-primary-muted text-primary border border-primary/20",
        success: "bg-success-muted text-success border border-success/20",
        warning: "bg-warning-muted text-warning border border-warning/20",
        destructive: "bg-danger-muted text-danger border border-danger/20",
        info: "bg-info-muted text-info border border-info/20",
        outline: "border border-gray-250 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
