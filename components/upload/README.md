# Upload Components

This directory contains file upload components for the AI Resume Analyzer application.

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

### Styling

The component uses Tailwind CSS and follows the application's design system with:
- Consistent spacing and border radius
- Primary, muted, and destructive color schemes
- Smooth transitions and hover effects
- Focus ring for accessibility

### Validation Rules

1. **File Type**: Only accepts `application/pdf` (.pdf files)
2. **File Limit**: Configurable maximum number of files (default: 5)
3. **Error Messages**: 
   - "文件格式无效，仅支持 PDF 格式" for invalid file types
   - "最多只能上传 {maxFiles} 个文件" when exceeding file limit

### Requirements Coverage

This component implements:
- **Requirement 1.1**: Drag-and-drop file upload support
- **Requirement 1.2**: Click-to-browse file upload support
- **Requirement 1.3**: Non-PDF file rejection with error messages
- **Requirement 1.4**: Support for uploading up to 5 PDF files simultaneously

### Next Steps

The file upload and progress tracking components will be implemented in subsequent tasks:
- Task 9.2: FileUploadProgress and FileUploadList components
- Task 9.3: Integration with upload API and SSE extraction progress
