'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesAccepted,
  maxFiles = 5,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
    },
    [onFilesAccepted]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles,
    disabled,
    multiple: true,
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer',
          'hover:border-primary/50 hover:bg-muted/50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          disabled && 'cursor-not-allowed opacity-50',
          !isDragActive && !isDragReject && 'border-muted-foreground/25'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex items-center justify-center w-16 h-16 rounded-full transition-colors',
              isDragActive && !isDragReject
                ? 'bg-primary/10 text-primary'
                : isDragReject
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {isDragReject ? (
              <X className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            {isDragActive && !isDragReject ? (
              <p className="text-lg font-medium text-primary">
                放开以上传文件
              </p>
            ) : isDragReject ? (
              <div className="space-y-1">
                <p className="text-lg font-medium text-destructive">
                  无效的文件格式
                </p>
                <p className="text-sm text-muted-foreground">
                  仅支持 PDF 格式文件
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-medium">
                  拖拽文件到这里，或{' '}
                  <span className="text-primary underline">点击浏览</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  仅支持 PDF 格式，最多 {maxFiles} 个文件
                </p>
              </div>
            )}
          </div>

          {/* File Icon Indicator */}
          {!isDragActive && (
            <div className="flex gap-2 mt-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                PDF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                {errors.map((error) => (
                  <p key={error.code} className="text-xs mt-1">
                    {error.code === 'file-invalid-type'
                      ? '文件格式无效，仅支持 PDF 格式'
                      : error.code === 'too-many-files'
                        ? `最多只能上传 ${maxFiles} 个文件`
                        : error.message}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
