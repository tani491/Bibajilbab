import { forwardRef, useId } from "react"
import type { InputHTMLAttributes, ReactNode } from "react"

import { cn } from "../lib/cn"

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string
  error?: string | undefined
  helperText?: string | undefined
  leftIcon?: ReactNode | undefined
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, className, label, error, helperText, leftIcon, disabled, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  return (
    <label className="block text-sm font-medium text-brand-ink" htmlFor={inputId}>
      {label ? <span className="mb-2 block">{label}</span> : null}
      <span className="relative block">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-card border bg-white px-3 text-sm text-brand-ink outline-none transition duration-200 placeholder:text-brand-muted/75 focus:border-brand-plum focus:shadow-focus disabled:cursor-not-allowed disabled:bg-brand-blush disabled:text-brand-muted",
            leftIcon ? "pl-10" : null,
            error ? "border-red-600 focus:border-red-700" : "border-brand-border",
            className,
          )}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? descriptionId : undefined}
          {...props}
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
