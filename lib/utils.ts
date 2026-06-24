import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID using crypto.randomUUID
 * @returns A unique UUID string
 */
export function generateId(): string {
  return crypto.randomUUID();
}
