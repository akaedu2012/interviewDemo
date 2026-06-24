'use client';

import { FileUploadProgress, UploadStatus } from './FileUploadProgress';
import { cn } from '@/lib/utils';

export interface FileUploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  extractionStage?: string;
  fileId?: string;
}

export interface FileUploadListProps {
  files: FileUploadItem[];
  onRetry?: (fileId: string) => void;
  className?: string;
}

/**
 * FileUploadList - 上传文件列表容器组件
 * 
 * 显示所有上传中和已上传的文件，包括：
 * - 每个文件的状态（uploading, processing, success, failed）
 * - 上传和提取进度
 * - 错误消息和重试功能
 * 
 * 需求: 1
 */
export function FileUploadList({
  files,
  onRetry,
  className,
}: FileUploadListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* 列表标题和统计 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          上传列表 ({files.length} 个文件)
        </h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>
            成功: {files.filter((f) => f.status === 'success').length}
          </span>
          <span>
            进行中:{' '}
            {
              files.filter(
                (f) => f.status === 'uploading' || f.status === 'processing'
              ).length
            }
          </span>
          <span>
            失败: {files.filter((f) => f.status === 'failed').length}
          </span>
        </div>
      </div>

      {/* 文件进度列表 */}
      <div className="space-y-2">
        {files.map((fileItem) => (
          <FileUploadProgress
            key={fileItem.id}
            fileName={fileItem.file.name}
            fileSize={fileItem.file.size}
            status={fileItem.status}
            progress={fileItem.progress}
            error={fileItem.error}
            extractionStage={fileItem.extractionStage}
            onRetry={onRetry ? () => onRetry(fileItem.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
