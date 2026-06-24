"use client"

import * as React from "react"
import { Button } from "./button"
import { Card } from "./card"

export interface ErrorBoundaryProps {
  /**
   * Child components to wrap
   */
  children: React.ReactNode
  /**
   * Custom fallback UI to display when an error occurs
   */
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>
  /**
   * Callback function called when an error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /**
   * Whether to reset the error boundary when children change
   */
  resetOnPropsChange?: boolean
  /**
   * Custom reset keys - when these change, the error boundary resets
   */
  resetKeys?: Array<string | number | boolean | null | undefined>
}

export interface ErrorBoundaryFallbackProps {
  /**
   * The error that was caught
   */
  error: Error
  /**
   * Function to reset the error boundary and retry rendering
   */
  resetErrorBoundary: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - React error boundary component for graceful error handling
 * Catches JavaScript errors in child components and displays a fallback UI
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     console.error("Error caught:", error, errorInfo)
 *   }}
 * >
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * const CustomFallback = ({ error, resetErrorBoundary }) => (
 *   <div>
 *     <h1>Oops! Something went wrong</h1>
 *     <pre>{error.message}</pre>
 *     <button onClick={resetErrorBoundary}>Try again</button>
 *   </div>
 * )
 *
 * <ErrorBoundary fallback={CustomFallback}>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset error boundary if reset keys changed
    if (hasError && resetKeys) {
      const hasResetKeysChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )
      if (hasResetKeysChanged) {
        this.reset()
      }
    }

    // Reset error boundary if children changed (optional)
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.reset()
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state
    const { children, fallback: FallbackComponent } = this.props

    if (hasError && error) {
      // Render custom fallback if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetErrorBoundary={this.reset} />
      }

      // Render default fallback UI
      return <DefaultErrorFallback error={error} resetErrorBoundary={this.reset} />
    }

    return children
  }
}

/**
 * DefaultErrorFallback - Default error UI displayed when no custom fallback is provided
 */
function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <div
      className="flex min-h-[400px] items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <Card className="w-full max-w-lg p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-destructive">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again or contact support if the
              problem persists.
            </p>
          </div>

          {/* Error details */}
          <details className="rounded-lg border border-border bg-muted/50 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Error details
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Error message:
                </p>
                <pre className="mt-1 overflow-auto rounded bg-background p-2 text-xs">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Stack trace:
                  </p>
                  <pre className="mt-1 max-h-[200px] overflow-auto rounded bg-background p-2 text-xs">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Reload page
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * Hook version for functional component error boundary functionality
 * Note: This requires a parent ErrorBoundary to actually catch the error
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error | null>(null)

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
