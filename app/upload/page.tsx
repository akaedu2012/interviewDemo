'use client';

import { FileDropzone } from '@/components/upload';

export default function UploadPage() {
  const handleFilesAccepted = (files: File[]) => {
    console.log('Accepted files:', files);
    // TODO: Implement file upload logic in next task
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">上传简历</h1>
        <p className="text-muted-foreground mt-2">
          上传 PDF 格式的简历文件，系统将自动解析和分析
        </p>
      </div>
      <FileDropzone onFilesAccepted={handleFilesAccepted} maxFiles={5} />
    </div>
  );
}
