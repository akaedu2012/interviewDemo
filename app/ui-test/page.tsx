"use client"

import * as React from "react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Modal } from "@/components/ui/Modal"
import { Notification } from "@/components/ui/Notification"
import { TagInput } from "@/components/ui/TagInput"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

/**
 * UI Components Test Page
 * This page demonstrates all the newly created UI components
 */
export default function UITestPage() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [tags, setTags] = React.useState<string[]>(["React", "TypeScript", "Next.js"])

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">UI Components Test</h1>

      {/* LoadingSpinner Test */}
      <Card>
        <CardHeader>
          <CardTitle>LoadingSpinner Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Small</p>
              <LoadingSpinner size="sm" />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Default</p>
              <LoadingSpinner />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Large</p>
              <LoadingSpinner size="lg" />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">With Text</p>
              <LoadingSpinner size="lg" text="Loading data..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Test */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Test Modal"
            description="This is a test modal dialog"
            footer={
              <>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>Confirm</Button>
              </>
            }
          >
            <p>This is the modal content. You can put any content here.</p>
          </Modal>
        </CardContent>
      </Card>

      {/* Notification Test */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => Notification.success("Success!", "Operation completed successfully")}
            >
              Success Toast
            </Button>
            <Button
              variant="destructive"
              onClick={() => Notification.error("Error!", "Something went wrong")}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => Notification.info("Info", "This is an informational message")}
            >
              Info Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => Notification.warning("Warning", "Please be careful")}
            >
              Warning Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const toastId = Notification.loading("Loading...")
                setTimeout(() => Notification.dismiss(toastId), 2000)
              }}
            >
              Loading Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TagInput Test */}
      <Card>
        <CardHeader>
          <CardTitle>TagInput Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Skills</p>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add skills (press Enter or comma to add)"
                maxTags={10}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Current tags: {tags.join(", ") || "None"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ErrorBoundary Test */}
      <Card>
        <CardHeader>
          <CardTitle>ErrorBoundary Component</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorBoundary>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The error boundary will catch any errors in child components.
              </p>
              <Button
                variant="destructive"
                onClick={() => {
                  throw new Error("Test error from button click")
                }}
              >
                Trigger Error
              </Button>
            </div>
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  )
}
