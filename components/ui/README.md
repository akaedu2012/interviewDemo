# UI Components Documentation

This directory contains all the reusable UI components for the AI Resume Analyzer application.

## Newly Created Components (Task 8.2)

### 1. LoadingSpinner.tsx ✅ (Already Existed)
A loading indicator component with configurable size and optional text.

**Features:**
- Multiple sizes: `sm`, `default`, `lg`, `xl`
- Optional loading text
- Accessible with ARIA attributes
- Animated spinner using lucide-react icons

**Usage:**
```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

// Simple spinner
<LoadingSpinner />

// Large spinner with text
<LoadingSpinner size="lg" text="Loading data..." />
```

### 2. Modal.tsx ✅ (Already Existed)
A modal dialog component based on shadcn/ui dialog.

**Features:**
- Built on shadcn/ui dialog primitives
- Configurable sizes: `sm`, `md`, `lg`, `xl`, `full`
- Optional title and description
- Custom footer content
- Trigger element support
- Close button control

**Usage:**
```tsx
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"

const [open, setOpen] = useState(false)

<Modal
  open={open}
  onOpenChange={setOpen}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Modal content goes here</p>
</Modal>
```

### 3. Notification.tsx ✅ (Newly Created)
A notification/toast component wrapper around sonner.

**Features:**
- Success, error, info, warning, and loading notifications
- Promise-based notifications
- Optional descriptions
- Dismissible toasts
- Toast ID management

**Usage:**
```tsx
import { Notification } from "@/components/ui/Notification"

// Success notification
Notification.success("File uploaded successfully")

// Error with description
Notification.error("Upload failed", "The file size exceeds the limit")

// Loading notification
const toastId = Notification.loading("Processing...")
// Later dismiss it
Notification.dismiss(toastId)

// Promise notification
Notification.promise(
  uploadFile(),
  {
    loading: "Uploading file...",
    success: "File uploaded successfully",
    error: "Failed to upload file"
  }
)
```

### 4. TagInput.tsx ✅ (Newly Created)
A multi-value tag input component for entering and managing tags.

**Features:**
- Add tags by pressing Enter, Tab, or typing separators (comma, semicolon)
- Remove tags with X button or Backspace key
- Paste multiple tags at once
- Maximum tag limit
- Duplicate prevention
- Custom validation
- Keyboard navigation
- Accessible with ARIA attributes

**Usage:**
```tsx
import { TagInput } from "@/components/ui/TagInput"

const [tags, setTags] = useState<string[]>(["React", "TypeScript"])

<TagInput
  value={tags}
  onChange={setTags}
  placeholder="Add skills (press Enter or comma to add)"
  maxTags={10}
  allowDuplicates={false}
  validate={(tag) => tag.length >= 2}
/>
```

**Advanced Features:**
- Custom separators: `separators={[",", ";", "|"]}`
- Custom tag styling: `tagClassName="your-classes"`
- Validation function: `validate={(tag) => /^[a-zA-Z]+$/.test(tag)}`

### 5. ErrorBoundary.tsx ✅ (Newly Created)
A React error boundary component for graceful error handling.

**Features:**
- Catches JavaScript errors in child components
- Displays fallback UI with error details
- Custom error handler callback
- Reset functionality
- Default fallback UI with error details and stack trace
- Custom fallback component support
- Auto-reset on prop changes (optional)

**Usage:**
```tsx
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

// Basic usage
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error("Error caught:", error, errorInfo)
  }}
>
  <YourApp />
</ErrorBoundary>

// Custom fallback
const CustomFallback = ({ error, resetErrorBoundary }) => (
  <div>
    <h1>Oops! Something went wrong</h1>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
)

<ErrorBoundary fallback={CustomFallback}>
  <YourApp />
</ErrorBoundary>

// Auto-reset on key changes
<ErrorBoundary resetKeys={[userId, dataVersion]}>
  <YourApp />
</ErrorBoundary>
```

**useErrorHandler Hook:**
```tsx
import { useErrorHandler } from "@/components/ui/ErrorBoundary"

function MyComponent() {
  const handleError = useErrorHandler()
  
  const fetchData = async () => {
    try {
      await api.getData()
    } catch (error) {
      handleError(error) // Will be caught by parent ErrorBoundary
    }
  }
}
```

## Existing Components

### button.tsx
Pre-configured button component with multiple variants and sizes.

### badge.tsx
Badge component for displaying tags, status indicators, etc.

### card.tsx
Card container component with header, content, and footer sections.

### dialog.tsx
Base dialog primitives from shadcn/ui.

### dropdown-menu.tsx
Dropdown menu component.

### input.tsx
Input field component with validation states.

### select.tsx
Select dropdown component.

### sonner.tsx
Toast notification provider (Sonner library wrapper).

### table.tsx
Table component for displaying tabular data.

## Component Usage Best Practices

1. **LoadingSpinner**: Use during asynchronous operations, data fetching
2. **Modal**: Use for confirmations, forms, or detailed information display
3. **Notification**: Use for user feedback after actions (success/error messages)
4. **TagInput**: Use for multi-value inputs like skills, tags, keywords
5. **ErrorBoundary**: Wrap your app or major sections to catch and handle errors gracefully

## Integration with Next.js

All components are marked with `"use client"` where needed for client-side interactivity. They can be imported and used in both client and server components.

## Accessibility

All components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader support
- Color contrast compliance

## Styling

Components use Tailwind CSS with the project's design system tokens. They support:
- Dark mode (via next-themes)
- Responsive design
- Custom className props for extending styles

## Testing

A test page is available at `/ui-test` to preview all components in action.
