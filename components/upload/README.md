# Upload Components

This directory contains file upload components for the AI Resume Analyzer application.

## Components Overview

1. **FileDropzone** - Drag-and-drop file selection
2. **FileUploadProgress** - Single file upload/extraction progress indicator
3. **FileUploadList** - Container for multiple file upload progress items

---

## FileDropzone

A drag-and-drop file upload component built with `react-dropzone` for uploading PDF resume files.

### Features

- **Drag-and-drop support**: Users can drag PDF files directly onto the dropzone
- **Click-to-browse**: Users can click the dropzone to open a file browser
- **PDF-only validation**: Automatically rejects non-PDF files with clear error messages
- **Multiple file support**: Supports uploading up to 5 files simultaneously (configurable)
- **Visual feedback**: 
  - Hover states for better UX
  - Active drag state with primary color highlight
  - Reject state with destructive color when invalid files are dragged
  - Disabled state support
- **Accessibility**: Keyboard navigable with focus states
- **Error handling**: Displays user-friendly error messages for rejected files
- **Responsive design**: Adapts to different screen sizes

### Props

```typescript
interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;  // Callback when files are accepted
  maxFiles?: number;                          // Maximum number of files (default: 5)
  disabled?: boolean;                         // Disable the dropzone (default: false)
  className?: string;                         // Additional CSS classes
}
```

### Usage Example

```tsx
import { FileDropzone } from '@/components/upload';

function UploadPage() {
  const handleFilesAccepted = (files: File[]) => {
    // Handle the accepted files
    console.log('Accepted files:', files);
    // Upload files to server...
  };

  return (
    <FileDropzone 
      onFilesAccepted={handleFilesAccepted}
      maxFiles={5}
    />
  );
}
```

### Requirements Coverage

This component implements:
- **Requirement 1.1**: Drag-and-drop file upload support
- **Requirement 1.2**: Click-to-browse file upload support
- **Requirement 1.3**: Non-PDF file rejection with error messages
- **Requirement 1.4**: Support for uploading up to 5 PDF files simultaneously

---

## FileUploadProgress

A single file upload progress indicator component that displays detailed upload and extraction status.

### Features

- **File information**: Displays file name (with truncation) and formatted file size (B/KB/MB)
- **Status icons**: Visual indicators for each state (pending, uploading, processing, success, failed)
- **Progress bar**: Animated progress bar with color coding
- **Progress percentage**: Numeric display of current progress
- **Extraction stages**: Visual stage indicators for AI extraction phases
- **Stage descriptions**: Chinese labels for extraction stages (基本信息, 教育背景, 工作经历, 技能标签)
- **Error display**: Shows error messages when upload/extraction fails
- **Retry button**: Allows users to retry failed uploads

### Upload Statuses

- `pending`: Waiting to upload
- `uploading`: File upload in progress (blue progress bar)
- `processing`: AI extraction in progress (blue progress bar with stage indicators)
- `success`: Upload and extraction completed successfully (green checkmark)
- `failed`: Upload or extraction failed (red X with error message)

### Extraction Stages

The component displays 4 extraction stages with visual indicators:

1. **basic** (基本信息) - 25% progress
2. **education** (教育背景) - 50% progress
3. **experience** (工作经历) - 75% progress
4. **skills** (技能标签) - 90% progress
5. **complete** (完成) - 100% progress

### Props

```typescript
interface FileUploadProgressProps {
  fileName: string;                    // Name of the file
  fileSize: number;                    // Size in bytes
  status: UploadStatus;                // Current status
  progress?: number;                   // Progress percentage (0-100)
  error?: string;                      // Error message (if failed)
  extractionStage?: string;            // Current extraction stage
  onRetry?: () => void;                // Retry callback
  className?: string;                  // Additional CSS classes
}

type UploadStatus = 'pending' | 'uploading' | 'processing' | 'success' | 'failed';
```

### Usage Example

```tsx
import { FileUploadProgress } from '@/components/upload';

function UploadList() {
  return (
    <FileUploadProgress
      fileName="john_doe_resume.pdf"
      fileSize={1024000}
      status="processing"
      progress={75}
      extractionStage="experience"
      onRetry={() => handleRetry('file-123')}
    />
  );
}
```

### Requirements Coverage

This component implements:
- **Requirement 1.5**: Display upload progress percentage
- **Requirement 1.6**: Display upload status (uploading, success, failed)
- **Requirement 1.7**: Display error message and allow retry
- **Requirements 3.6, 4.6, 5.6, 6.5**: Display AI extraction progress via SSE
- **Requirement 19**: Loading state management

---

## FileUploadList

A container component that manages and displays multiple file upload progress items.

### Features

- **File count statistics**: Shows total number of files
- **Status breakdown**: Displays counts for success/in-progress/failed files
- **Progress list**: Renders FileUploadProgress for each file
- **Retry support**: Passes retry callbacks to individual progress items
- **Auto-hide**: Hides when no files are being uploaded

### Props

```typescript
interface FileUploadListProps {
  files: FileUploadItem[];              // Array of file upload items
  onRetry?: (fileId: string) => void;   // Retry callback
  className?: string;                   // Additional CSS classes
}

interface FileUploadItem {
  id: string;                           // Unique identifier
  file: File;                           // File object
  status: UploadStatus;                 // Current status
  progress: number;                     // Progress percentage
  error?: string;                       // Error message (if any)
  extractionStage?: string;             // AI extraction stage
  fileId?: string;                      // Server-assigned file ID
}
```

### Usage Example

```tsx
import { FileUploadList, FileUploadItem } from '@/components/upload';

function UploadPage() {
  const [files, setFiles] = useState<FileUploadItem[]>([
    {
      id: 'file-1',
      file: new File([''], 'resume1.pdf'),
      status: 'processing',
      progress: 50,
      extractionStage: 'education',
    },
    {
      id: 'file-2',
      file: new File([''], 'resume2.pdf'),
      status: 'success',
      progress: 100,
    },
  ]);

  const handleRetry = (fileId: string) => {
    // Retry upload logic
  };

  return <FileUploadList files={files} onRetry={handleRetry} />;
}
```

### Requirements Coverage

This component implements:
- **Requirement 1**: Complete file upload workflow management
- **Requirement 19**: Loading state management and visual feedback

---

## Complete Upload Flow

The upload workflow consists of the following steps:

### 1. File Selection
User selects files via FileDropzone (drag-and-drop or click-to-browse)

### 2. Upload Phase
- Files are uploaded to `/api/resumes/upload` via multipart/form-data
- Upload progress is simulated (actual upload is usually very fast)
- FileUploadProgress shows "uploading" status with blue progress bar

### 3. Processing Phase
- Server returns file IDs for successfully uploaded files
- SSE connection is established for each file via `/api/resumes/[fileId]/extract`
- FileUploadProgress shows "processing" status with stage indicators

### 4. Extraction Progress
Real-time updates via Server-Sent Events:
- **Stage 1**: Basic info extraction (name, email, phone, city) - 25%
- **Stage 2**: Education extraction (school, major, degree) - 50%
- **Stage 3**: Experience extraction (company, title, dates, responsibilities) - 75%
- **Stage 4**: Skills extraction (technical, tools, languages) - 90%
- **Stage 5**: Complete - 100%

### 5. Completion
- Files marked as "success" with green checkmark
- Success notification displayed
- After all files complete, auto-navigate to candidate list (2s delay)

### 6. Error Handling
- Upload errors: Show error message with retry button
- Extraction errors: Show error message from SSE error event
- Connection errors: Detect EventSource connection failure

---

## Integration Example

See `app/upload/page.tsx` for a complete integration example that includes:

```tsx
import { useState, useCallback } from 'react';
import { FileDropzone, FileUploadList, FileUploadItem } from '@/components/upload';

export default function UploadPage() {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);

  const handleFilesAccepted = async (files: File[]) => {
    // 1. Add files to state with "uploading" status
    // 2. Upload to /api/resumes/upload
    // 3. Establish SSE connections for each file
    // 4. Update progress as events arrive
    // 5. Handle completion and navigation
  };

  const handleRetry = (fileId: string) => {
    // Remove failed file and retry upload
  };

  return (
    <>
      <FileDropzone onFilesAccepted={handleFilesAccepted} />
      <FileUploadList files={uploadFiles} onRetry={handleRetry} />
    </>
  );
}
```

Key implementation details:
- Uses `EventSource` API for SSE connections
- Stores EventSource references in `useRef` for cleanup
- Updates file status based on SSE events (progress, complete, error)
- Cleans up connections on component unmount
- Auto-navigates using Next.js router after all files complete

---

## Styling

All components use:
- **Tailwind CSS** for styling
- **shadcn/ui** components (Button, Card)
- **lucide-react** icons
- **Consistent color scheme**:
  - Primary (blue) for active/in-progress states
  - Green for success states
  - Red (destructive) for error states
  - Muted gray for pending/inactive states
- **Smooth animations** for progress bars and state transitions

---

## Requirements Summary

These components collectively implement the following requirements:

### Requirement 1: 简历文件上传
- ✅ 1.1: Drag-and-drop support
- ✅ 1.2: Click-to-browse support
- ✅ 1.3: PDF-only validation with error messages
- ✅ 1.4: Multiple file upload (up to 5 files)
- ✅ 1.5: Upload progress display
- ✅ 1.6: Upload status display
- ✅ 1.7: Error handling and retry functionality

### Requirements 3-6: AI 提取
- ✅ 3.6: SSE streaming for basic info extraction
- ✅ 4.6: SSE streaming for education extraction
- ✅ 5.6: SSE streaming for experience extraction
- ✅ 6.5: SSE streaming for skills extraction

### Requirement 19: 加载状态管理
- ✅ 19.1: Loading indicators during operations
- ✅ 19.2: Loading state for data fetching
- ✅ 19.3: Disable controls during upload
- ✅ 19.4: Remove loading indicators promptly after completion
