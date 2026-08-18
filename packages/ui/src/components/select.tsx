import { ChevronDown } from "lucide-react"
import { forwardRef, useId } from "react"
import type { SelectHTMLAttributes } from "react"

import { cn } from "../lib/cn"

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, className, label, error, helperText, options, placeholder, disabled, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const descriptionId = `${selectId}-description`

  return (
    <label className="block text-sm font-medium text-brand-ink" htmlFor={selectId}>
      {label ? <span className="mb-2 block">{label}</span> : null}
      <span className="relative block">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-card border bg-white px-3 pr-10 text-sm text-brand-ink outline-none transition duration-200 focus:border-brand-plum focus:shadow-focus disabled:cursor-not-allowed disabled:bg-brand-blush disabled:text-brand-muted",
            error ? "border-red-600 focus:border-red-700" : "border-brand-border",
            className,
          )}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? descriptionId : undefined}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
        />
      </span>
      {error || helperText ? (
        <span
          id={descriptionId}
          className={cn("mt-2 block text-xs", error ? "text-red-700" : "text-brand-muted")}
        >
          {error ?? helperText}
        </span>
      ) : null}
    </label>
  )
})
