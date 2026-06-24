"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { Button } from "./button"

export interface ModalProps {
  /**
   * Controls whether the modal is open
   */
  open?: boolean
  /**
   * Callback when the open state changes
   */
  onOpenChange?: (open: boolean) => void
  /**
   * The trigger element that opens the modal (optional)
   */
  trigger?: React.ReactNode
  /**
   * The modal title
   */
  title?: string
  /**
   * The modal description/subtitle
   */
  description?: string
  /**
   * The main content of the modal
   */
  children: React.ReactNode
  /**
   * Footer content (typically buttons)
   */
  footer?: React.ReactNode
  /**
   * Whether to show the X close button in the header
   */
  showCloseButton?: boolean
  /**
   * Whether to show a default close button in the footer
   */
  showFooterCloseButton?: boolean
  /**
   * Custom className for the dialog content
   */
  className?: string
  /**
   * Size of the modal
   */
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-[90vw]",
}

/**
 * Modal - A modal dialog component based on shadcn dialog
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>This action cannot be undone.</p>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  showFooterCloseButton = false,
  className,
  size = "md",
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        showCloseButton={showCloseButton}
        className={`${sizeClasses[size]} ${className || ""}`}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="py-2">{children}</div>
        {(footer || showFooterCloseButton) && (
          <DialogFooter showCloseButton={showFooterCloseButton}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Export dialog components for advanced usage
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
