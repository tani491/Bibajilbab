import { forwardRef, useId } from "react"
import type { TextareaHTMLAttributes } from "react"

import { cn } from "../lib/cn"

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, className, label, error, helperText, disabled, rows = 4, ...props },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const descriptionId = `${textareaId}-description`

  return (
    <label className="block text-sm font-medium text-brand-ink" htmlFor={textareaId}>
      {label ? <span className="mb-2 block">{label}</span> : null}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-card border bg-white px-3 py-3 text-sm text-brand-ink outline-none transition duration-200 placeholder:text-brand-muted/75 focus:border-brand-plum focus:shadow-focus disabled:cursor-not-allowed disabled:bg-brand-blush disabled:text-brand-muted",
          error ? "border-red-600 focus:border-red-700" : "border-brand-border",
          className,
        )}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || helperText ? descriptionId : undefined}
        {...props}
      />
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
