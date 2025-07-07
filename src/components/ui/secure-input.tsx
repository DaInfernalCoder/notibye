import * as React from "react"
import { cn } from "@/lib/utils"
import { sanitizeInput } from "@/lib/sanitize"

interface SecureInputProps extends React.ComponentProps<"input"> {
  sanitize?: boolean;
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ className, type, sanitize = true, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (sanitize && onChange) {
        const sanitizedValue = sanitizeInput(event.target.value);
        const syntheticEvent = {
          ...event,
          target: { ...event.target, value: sanitizedValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      } else if (onChange) {
        onChange(event);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
SecureInput.displayName = "SecureInput"

export { SecureInput }