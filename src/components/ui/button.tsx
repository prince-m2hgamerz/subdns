import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:brightness-110 active:brightness-90",
        secondary:
          "bg-white/[0.04] backdrop-blur-xl border border-white/10 text-foreground hover:border-white/15 active:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        outline:
          "border border-white/10 text-foreground bg-white/[0.04] backdrop-blur-xl hover:border-white/15 active:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        ghost:
          "text-[#888888] hover:text-[#FFFFFF] hover:bg-white/[0.04] hover:backdrop-blur-xl hover:border hover:border-white/10 active:bg-white/[0.08]",
        destructive:
        "bg-danger text-danger-foreground hover:brightness-110 active:brightness-90",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded px-3 text-xs gap-1.5",
        md: "h-9 rounded-md px-4 text-sm gap-2",
        lg: "h-10 rounded-lg px-5 text-sm gap-2",
        xl: "h-12 rounded-lg px-6 text-base gap-2.5",
        icon: "h-9 w-9 rounded-md",
        "icon-sm": "h-8 w-8 rounded",
        nav: "h-8 rounded px-3.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
