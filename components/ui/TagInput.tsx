"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Input } from "./input"

export interface TagInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /**
   * Array of tag values
   */
  value: string[]
  /**
   * Callback when tags change
   */
  onChange: (tags: string[]) => void
  /**
   * Placeholder text for the input
   */
  placeholder?: string
  /**
   * Maximum number of tags allowed
   */
  maxTags?: number
  /**
   * Whether to allow duplicate tags
   */
  allowDuplicates?: boolean
  /**
   * Custom className for the container
   */
  className?: string
  /**
   * Custom className for individual tags
   */
  tagClassName?: string
  /**
   * Custom validation function for tag input
   */
  validate?: (tag: string) => boolean
  /**
   * Separator characters to split input into multiple tags
   */
  separators?: string[]
}

/**
 * TagInput - A multi-value tag input component
 * Supports keyboard navigation, paste handling, and tag removal
 *
 * @example
 * ```tsx
 * const [tags, setTags] = useState<string[]>([])
 *
 * <TagInput
 *   value={tags}
 *   onChange={setTags}
 *   placeholder="Type and press Enter to add tags"
 *   maxTags={10}
 * />
 * ```
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  maxTags,
  allowDuplicates = false,
  className,
  tagClassName,
  validate,
  separators = [",", ";"],
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const addTag = React.useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()
      
      if (!trimmedTag) return

      // Check if max tags reached
      if (maxTags && value.length >= maxTags) return

      // Check for duplicates
      if (!allowDuplicates && value.includes(trimmedTag)) return

      // Custom validation
      if (validate && !validate(trimmedTag)) return

      onChange([...value, trimmedTag])
      setInputValue("")
    },
    [value, onChange, maxTags, allowDuplicates, validate]
  )

  const removeTag = React.useCallback(
    (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove))
    },
    [value, onChange]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value.length - 1)
      }
    },
    [inputValue, value, addTag, removeTag]
  )

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // Check for separator characters
      const hasSeparator = separators.some((sep) => newValue.includes(sep))
      
      if (hasSeparator) {
        // Split by all separators and add as tags
        const regex = new RegExp(`[${separators.map(s => `\\${s}`).join("")}]`)
        const tags = newValue.split(regex).filter((tag) => tag.trim())
        tags.forEach((tag) => addTag(tag))
        setInputValue("")
      } else {
        setInputValue(newValue)
      }
    },
    [separators, addTag]
  )

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData("text")
      
      // Try to split by common separators
      const allSeparators = [...separators, "\n", "\t"]
      const regex = new RegExp(`[${allSeparators.map(s => `\\${s}`).join("")}]`)
      const tags = pastedText.split(regex).filter((tag) => tag.trim())
      
      if (tags.length > 1) {
        // Multiple tags detected
        tags.forEach((tag) => addTag(tag))
      } else {
        // Single value, treat as normal input
        setInputValue(pastedText)
      }
    },
    [separators, addTag]
  )

  const handleContainerClick = React.useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const isMaxTagsReached = maxTags ? value.length >= maxTags : false

  return (
    <div
      className={cn(
        "flex min-h-[2rem] w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        isMaxTagsReached && "opacity-60",
        className
      )}
      onClick={handleContainerClick}
      role="combobox"
      aria-expanded="false"
      aria-haspopup="listbox"
      aria-label="Tag input"
    >
      {value.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="secondary"
          className={cn(
            "gap-1 pr-1.5 [&>svg]:hover:text-destructive",
            tagClassName
          )}
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
            className="flex items-center justify-center rounded-sm hover:bg-muted"
            aria-label={`Remove ${tag} tag`}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      
      {!isMaxTagsReached && (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? placeholder : ""}
          className={cn(
            "h-6 min-w-[120px] flex-1 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0",
            value.length === 0 && "min-w-full"
          )}
          aria-label="Tag input field"
          {...props}
        />
      )}
    </div>
  )
}
