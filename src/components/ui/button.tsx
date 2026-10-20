import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "./slot";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-forest-700 text-paper shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] hover:bg-forest-800",
        secondary: "bg-white text-stone-900 ring-1 ring-stone-200 hover:ring-stone-300 hover:bg-stone-50",
        ghost: "text-stone-700 hover:bg-stone-900/5",
        light: "bg-paper text-forest-900 hover:bg-white",
        outlineLight: "text-paper ring-1 ring-paper/30 hover:bg-paper/10",
        clay: "bg-clay text-white hover:bg-[#b5623f]",
        link: "rounded-md px-0 text-forest-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-13 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
