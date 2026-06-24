"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      sm: "size-4",
      default: "size-6",
      lg: "size-8",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Optional text to display below the spinner
   */
  text?: string
}

/**
 * LoadingSpinner - A loading indicator component with configurable size
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading data..." />
 * ```
 */
export function LoadingSpinner({
  size,
  text,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      {...props}
    >
      <Loader2Icon className={cn(spinnerVariants({ size }))} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
      <span className="sr-only">{text || "Loading..."}</span>
    </div>
  )
}
