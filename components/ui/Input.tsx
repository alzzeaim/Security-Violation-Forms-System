import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full text-right">
        {label ? (
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        ) : null}
        <div className="relative rounded-lg shadow-sm">
          {icon ? (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          ) : null}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm outline-none text-right placeholder-gray-400 focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all duration-150 disabled:bg-gray-50 disabled:text-gray-500",
              icon && "pl-10",
              error && "border-danger focus:border-danger focus:ring-danger/15",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <span className="block text-xs text-danger mt-1 font-medium">{error}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
