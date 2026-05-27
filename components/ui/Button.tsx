import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all duration-200 outline-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none px-5 py-3 cursor-pointer",
          // Primary Qiddiya Gold
          variant === "primary" && "bg-accent text-primary border border-accent-dark hover:bg-accent-light shadow-sm hover:shadow",
          // Secondary Deep Navy
          variant === "secondary" && "bg-primary text-white hover:bg-primary-light border border-primary-dark shadow-sm hover:shadow",
          // Danger Red
          variant === "danger" && "bg-danger text-white hover:bg-danger/90 shadow-sm",
          // Outline
          variant === "outline" && "border border-customBorder bg-white text-primary hover:bg-gray-50 hover:border-gray-300",
          // Ghost
          variant === "ghost" && "text-primary hover:bg-gray-100",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
