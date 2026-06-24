"use client"

import { toast } from "sonner"

/**
 * Notification utility using sonner toast
 * This is a convenient wrapper around the sonner toast API
 */
export const Notification = {
  /**
   * Display a success notification
   * @param message - The message to display
   * @param description - Optional description text
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    })
  },

  /**
   * Display an error notification
   * @param message - The message to display
   * @param description - Optional description text
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
    })
  },

  /**
   * Display an info notification
   * @param message - The message to display
   * @param description - Optional description text
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    })
  },

  /**
   * Display a warning notification
   * @param message - The message to display
   * @param description - Optional description text
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
    })
  },

  /**
   * Display a loading notification
   * @param message - The message to display
   * @param description - Optional description text
   * @returns Toast ID that can be used to dismiss or update the toast
   */
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    })
  },

  /**
   * Display a promise notification that updates based on promise state
   * @param promise - The promise to track
   * @param messages - Messages for loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },

  /**
   * Dismiss a specific toast by ID
   * @param toastId - The ID of the toast to dismiss
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
}

/**
 * @example
 * ```tsx
 * // Success notification
 * Notification.success("File uploaded successfully")
 *
 * // Error notification with description
 * Notification.error("Upload failed", "The file size exceeds the limit")
 *
 * // Loading notification
 * const toastId = Notification.loading("Processing...")
 * // Later dismiss it
 * Notification.dismiss(toastId)
 *
 * // Promise notification
 * Notification.promise(
 *   uploadFile(),
 *   {
 *     loading: "Uploading file...",
 *     success: "File uploaded successfully",
 *     error: "Failed to upload file"
 *   }
 * )
 * ```
 */
