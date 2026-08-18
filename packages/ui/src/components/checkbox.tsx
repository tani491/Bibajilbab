import { Check } from "lucide-react"
import { forwardRef, useId } from "react"
import type { InputHTMLAttributes } from "react"

import { cn } from "../lib/cn"

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
  error?: string
  helperText?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, className, label, error, helperText, disabled, ...props },
  ref,
) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const descriptionId = `${checkboxId}-description`

  return (
    <span className="block">
      <label
        className="flex items-start gap-3 text-sm font-medium text-brand-ink"
        htmlFor={checkboxId}
      >
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              "peer h-5 w-5 cursor-pointer appearance-none rounded border bg-white transition duration-200 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:bg-brand-blush",
              error ? "border-red-600" : "border-brand-border checked:border-brand-plum",
              className,
            )}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? descriptionId : undefined}
            {...props}
          />
          <span className="pointer-events-none absolute inset-0 rounded bg-brand-plum opacity-0 transition peer-checked:opacity-100" />
          <Check
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-0.5 z-10 h-4 w-4 scale-75 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
          />
        </span>
        <span>{label}</span>
      </label>
      {error || helperText ? (
        <span
          id={descriptionId}
          className={cn("mt-2 block pl-8 text-xs", error ? "text-red-700" : "text-brand-muted")}
        >
          {error ?? helperText}
        </span>
      ) : null}
    </span>
  )
})
