import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CheckboxProps {
  id: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, checked, onCheckedChange, label, className }, ref) => {
    return (
      <div className="flex items-center gap-3 dir-rtl text-right">
        <CheckboxPrimitive.Root
          id={id}
          ref={ref}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange?.(val === true)}
          className={cn(
            "peer h-5 w-5 shrink-0 rounded border border-gray-300 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:border-accent-dark data-[state=checked]:text-primary transition-all duration-150 cursor-pointer flex items-center justify-center",
            className
          )}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-primary">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label ? (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-800 cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 leading-none"
          >
            {label}
          </label>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
