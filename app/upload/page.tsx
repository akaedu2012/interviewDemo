'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileDropzone, FileUploadList, FileUploadItem, UploadStatus } from '@/components/upload';
import { Notification } from '@/components/ui/Notification';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';

/**
 * UploadPage - 简历上传页面
 * 
 * 功能：
 * 1. 集成 FileDropzone 和 FileUploadList 组件
 * 2. 实现文件上传逻辑（调用 /api/resumes/upload）
 * 3. 实现 SSE 连接监听提取进度（EventSource API）
 * 4. 实时显示 AI 提取进度（basic → education → experience → skills → complete）
 * 5. 提取完成后显示成功通知并导航到候选人列表
 * 6. 处理上传和提取错误，显示错误消息
 * 
 * 需求: 1, 3, 4, 5, 6, 19
 */
export default function UploadPage() {
  const router = useRouter();
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  /**
   * 生成唯一的文件 ID
   */
  const generateFileId = (): string => {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * 使用简化 API 进行提取（非 SSE）
   */
  const extractWithSimpleAPI = useCallback(
    async (fileId: string, uploadedFileId: string) => {
      try {
        // 更新状态为处理中
        setUploadFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'processing' as UploadStatus,
                  progress: 10,
                  extractionStage: 'processing',
                }
              : file
          )
        );

        // 调用简化 API
        const response = await fetch(
          `/api/resumes/${uploadedFileId}/extract-simple`,
          {
            method: 'POST',
          }
        );

        const result = await response.json();

        if (result.success && result.data) {
          // 提取成功
          setUploadFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? {
                    ...file,
                    status: 'success' as UploadStatus,
                    progress: 100,
                    extractionStage: 'complete',
                  }
                : file
            )
          );

          Notification.success('简历提取完成', result.data.message);

          // 检查是否所有文件都已完成
          setUploadFiles((prev) => {
            const allCompleted = prev.every(
              (f) => f.status === 'success' || f.status === 'failed'
            );
            if (allCompleted) {
              setTimeout(() => {
                router.push('/');
              }, 2000);
            }
            return prev;
          });
        } else {
          throw new Error(result.error || '提取失败');
        }
      } catch (error) {
        console.error('Extraction error:', error);

        setUploadFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'failed' as UploadStatus,
                  error:
                    error instanceof Error
                      ? error.message
                      : '提取失败',
                }
              : file
          )
        );

        Notification.error(
          '提取失败',
          error instanceof Error ? error.message : '请稍后重试'
        );
      }
    },
    [router]
  );

  /**
   * 连接 SSE 监听提取进度
   * 注意：此方法在 Vercel 环境可能不稳定，建议使用 extractWithSimpleAPI
   */
  const connectExtractionSSE = useCallback(
    (fileId: string, uploadedFileId: string) => {
      const eventSource = new EventSource(`/api/resumes/${uploadedFileId}/extract`);

      // 存储 EventSource 引用
      eventSourcesRef.current.set(fileId, eventSource);

      // 监听进度事件
      eventSource.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Extraction progress:', data);

          setUploadFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? {
                    ...file,
                    status: 'processing' as UploadStatus,
                    extractionStage: data.stage,
                    progress: getProgressByStage(data.stage),
                  }
                : file
            )
          );
        } catch (error) {
          console.error('Failed to parse progress event:', error);
        }
      });

      // 监听完成事件
      eventSource.addEventListener('complete', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Extraction complete:', data);

          setUploadFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? {
                    ...file,
                    status: 'success' as UploadStatus,
                    progress: 100,
                    extractionStage: 'complete',
                  }
                : file
            )
          );

          // 显示成功通知
          Notification.success('简历提取完成', `${data.message}`);

          // 关闭 EventSource
          eventSource.close();
          eventSourcesRef.current.delete(fileId);

          // 检查是否所有文件都已完成
          setUploadFiles((prev) => {
            const allCompleted = prev.every(
              (f) => f.status === 'success' || f.status === 'failed'
            );
            if (allCompleted) {
              // 延迟导航到候选人列表
              setTimeout(() => {
                router.push('/');
              }, 2000);
            }
            return prev;
          });
        } catch (error) {
          console.error('Failed to parse complete event:', error);
        }
      });

      // 监听错误事件
      eventSource.addEventListener('error', (event: Event) => {
        const messageEvent = event as MessageEvent;
        let errorMessage = '提取过程中发生错误';
        let errorCode = 'UNKNOWN_ERROR';

        try {
          if (messageEvent.data) {
            const data = JSON.parse(messageEvent.data);
            errorMessage = data.error || errorMessage;
            errorCode = data.code || errorCode;
          }
        } catch (error) {
          console.error('Failed to parse error event:', error);
        }

        console.error('Extraction error:', errorMessage, errorCode);

        setUploadFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'failed' as UploadStatus,
                  error: errorMessage,
                }
              : file
          )
        );

        // 显示错误通知
        Notification.error('提取失败', errorMessage);

        // 关闭 EventSource
        eventSource.close();
        eventSourcesRef.current.delete(fileId);
      });

      // 监听连接错误（网络问题）
      eventSource.onerror = (error) => {
        console.error('EventSource connection error:', error);

        // 只在连接失败时更新状态（不是正常的错误事件）
        if (eventSource.readyState === EventSource.CLOSED) {
          setUploadFiles((prev) =>
            prev.map((file) =>
              file.id === fileId && file.status === 'processing'
                ? {
                    ...file,
                    status: 'failed' as UploadStatus,
                    error: '连接中断，提取失败',
                  }
                : file
            )
          );

          Notification.error('连接错误', '与服务器的连接中断');
          eventSource.close();
          eventSourcesRef.current.delete(fileId);
        }
      };
    },
    [router]
  );

  /**
   * 根据提取阶段计算进度百分比
   */
  const getProgressByStage = (stage: string): number => {
    switch (stage) {
      case 'basic':
        return 25;
      case 'education':
        return 50;
      case 'experience':
        return 75;
      case 'skills':
        return 90;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

  /**
   * 上传文件到服务器
   */
  const uploadFilesToServer = useCallback(
    async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      return await response.json();
    },
    []
  );

  /**
   * 处理文件选择
   */
  const handleFilesAccepted = useCallback(
    async (files: File[]) => {
      if (isUploading) {
        Notification.warning('请等待当前上传完成');
        return;
      }

      // 创建文件上传项
      const newFileItems: FileUploadItem[] = files.map((file) => ({
        id: generateFileId(),
        file,
        status: 'uploading' as UploadStatus,
        progress: 0,
      }));

      setUploadFiles((prev) => [...prev, ...newFileItems]);
      setIsUploading(true);

      try {
        // 上传文件
        console.log('Uploading files:', files.map((f) => f.name));

        // 模拟上传进度（实际应该通过 XMLHttpRequest 或其他方式获取真实进度）
        const progressInterval = setInterval(() => {
          setUploadFiles((prev) =>
            prev.map((file) =>
              newFileItems.some((item) => item.id === file.id) &&
              file.status === 'uploading'
                ? { ...file, progress: Math.min(file.progress + 10, 90) }
                : file
            )
          );
        }, 200);

        const uploadResult = await uploadFilesToServer(files);

        clearInterval(progressInterval);

        // 处理上传结果
        if (uploadResult.success && uploadResult.data?.uploads) {
          const uploads = uploadResult.data.uploads;

          // 更新文件状态
          setUploadFiles((prev) =>
            prev.map((file) => {
              const uploadInfo = uploads.find(
                (u: any) => u.fileName === file.file.name
              );

              if (!uploadInfo) return file;

              if (uploadInfo.status === 'uploaded') {
                // 上传成功，开始提取
                return {
                  ...file,
                  status: 'processing' as UploadStatus,
                  progress: 0,
                  fileId: uploadInfo.fileId,
                };
              } else {
                // 上传失败
                return {
                  ...file,
                  status: 'failed' as UploadStatus,
                  error: uploadInfo.error || '上传失败',
                };
              }
            })
          );

          // 为每个成功上传的文件使用简化 API 进行提取（不使用 SSE）
          uploads.forEach((upload: any) => {
            if (upload.status === 'uploaded' && upload.fileId) {
              const fileItem = newFileItems.find(
                (item) => item.file.name === upload.fileName
              );
              if (fileItem) {
                // 使用简化 API 而不是 SSE
                extractWithSimpleAPI(fileItem.id, upload.fileId);
              }
            }
          });

          // 显示上传结果通知
          const summary = uploadResult.data.summary;
          if (summary) {
            if (summary.failed > 0) {
              Notification.warning(
                '部分文件上传失败',
                `成功: ${summary.successful}, 失败: ${summary.failed}`
              );
            } else {
              Notification.success('文件上传成功', '开始提取简历信息...');
            }
          }
        } else {
          throw new Error(uploadResult.error || '上传失败');
        }
      } catch (error) {
        console.error('Upload error:', error);

        // 更新所有上传中的文件为失败状态
        setUploadFiles((prev) =>
          prev.map((file) =>
            newFileItems.some((item) => item.id === file.id)
              ? {
                  ...file,
                  status: 'failed' as UploadStatus,
                  error:
                    error instanceof Error ? error.message : '上传失败',
                }
              : file
          )
        );

        Notification.error(
          '上传失败',
          error instanceof Error ? error.message : '请稍后重试'
        );
      } finally {
        setIsUploading(false);
      }
    },
    [isUploading, uploadFilesToServer, extractWithSimpleAPI]
  );

  /**
   * 重试上传
   */
  const handleRetry = useCallback(
    (fileId: string) => {
      const fileItem = uploadFiles.find((f) => f.id === fileId);
      if (!fileItem) return;

      // 移除失败的文件
      setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));

      // 重新上传
      handleFilesAccepted([fileItem.file]);
    },
    [uploadFiles, handleFilesAccepted]
  );

  /**
   * 清理 EventSource 连接
   */
  const cleanupEventSources = useCallback(() => {
    eventSourcesRef.current.forEach((eventSource) => {
      eventSource.close();
    });
    eventSourcesRef.current.clear();
  }, []);

  // 组件卸载时清理连接
  useState(() => {
    return cleanupEventSources;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      {/* 页面标题 */}
      <div className="glass-hover rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            title="返回候选人列表"
            className="hover:bg-white/5 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                上传简历
              </h1>
            </div>
            <p className="text-slate-400 mt-2 ml-4 flex items-center space-x-2">
              <Upload className="h-4 w-4 text-cyan-400" />
              <span>上传 PDF 格式的简历文件，AI 将自动解析和分析</span>
            </p>
          </div>
        </div>
      </div>

      {/* 文件拖放区 */}
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl" />
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          maxFiles={5}
          disabled={isUploading}
        />
      </div>

      {/* 上传文件列表 */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
            <h2 className="text-xl font-semibold text-cyan-300">
              上传进度
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </div>
          <FileUploadList files={uploadFiles} onRetry={handleRetry} />
        </div>
      )}

      {/* 成功提示 */}
      {uploadFiles.length > 0 &&
        uploadFiles.every((f) => f.status === 'success') && (
          <div className="glass-hover rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/30 blur-xl animate-pulse" />
                <div className="relative h-12 w-12 rounded-full border-2 border-cyan-500 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-cyan-300">
                  所有文件已成功上传和提取！
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  即将跳转到候选人列表...
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
