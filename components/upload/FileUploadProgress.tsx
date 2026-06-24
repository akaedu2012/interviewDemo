'use client';

import { CheckCircle2, XCircle, Loader2, RefreshCw, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'success' | 'failed';

export interface FileUploadProgressProps {
  fileName: string;
  fileSize: number;
  status: UploadStatus;
  progress?: number;
  error?: string;
  extractionStage?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * FileUploadProgress - 单个文件上传进度条组件
 * 
 * 显示文件上传的状态和进度信息：
 * - uploading: 文件上传中，显示上传进度条
 * - processing: AI 提取中，显示提取阶段
 * - success: 上传和提取成功
 * - failed: 上传或提取失败，提供重试按钮
 * 
 * 需求: 1
 */
export function FileUploadProgress({
  fileName,
  fileSize,
  status,
  progress = 0,
  error,
  extractionStage,
  onRetry,
  className,
}: FileUploadProgressProps) {
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
        return <FileText className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '等待上传';
      case 'uploading':
        return '上传中';
      case 'processing':
        return `AI 提取中 ${extractionStage ? `- ${extractionStage}` : ''}`;
      case 'success':
        return '完成';
      case 'failed':
        return error || '上传失败';
      default:
        return '';
    }
  };

  // 获取提取阶段的中文描述
  const getExtractionStageText = (stage?: string): string => {
    switch (stage) {
      case 'basic':
        return '基本信息';
      case 'education':
        return '教育背景';
      case 'experience':
        return '工作经历';
      case 'skills':
        return '技能标签';
      case 'complete':
        return '完成';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* 状态图标 */}
          <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>

          {/* 文件信息和进度 */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* 文件名和大小 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={fileName}>
                  {fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileSize)}
                </p>
              </div>

              {/* 重试按钮 */}
              {status === 'failed' && onRetry && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onRetry}
                  className="flex-shrink-0"
                  title="重试上传"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* 状态文本 */}
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-xs font-medium',
                  status === 'success' && 'text-green-600',
                  status === 'failed' && 'text-destructive',
                  (status === 'uploading' || status === 'processing') && 'text-primary',
                  status === 'pending' && 'text-muted-foreground'
                )}
              >
                {getStatusText()}
              </p>

              {/* 进度百分比 */}
              {(status === 'uploading' || status === 'processing') && (
                <p className="text-xs text-muted-foreground font-medium">
                  {progress}%
                </p>
              )}
            </div>

            {/* 进度条 */}
            {(status === 'uploading' || status === 'processing') && (
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300 ease-out rounded-full',
                    status === 'uploading' && 'bg-primary',
                    status === 'processing' && 'bg-blue-500'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* 提取阶段指示器 */}
            {status === 'processing' && extractionStage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1">
                  {['basic', 'education', 'experience', 'skills'].map((stage) => (
                    <div
                      key={stage}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        extractionStage === stage && 'bg-blue-500',
                        extractionStage !== stage && 'bg-muted'
                      )}
                      title={getExtractionStageText(stage)}
                    />
                  ))}
                </div>
                <span>{getExtractionStageText(extractionStage)}</span>
              </div>
            )}

            {/* 错误消息 */}
            {status === 'failed' && error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
