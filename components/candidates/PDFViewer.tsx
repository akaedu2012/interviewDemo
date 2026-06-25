"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, AlertCircle } from "lucide-react";

interface PDFViewerProps {
  filePath: string;
  fileName: string;
}

/**
 * PDF预览组件
 * 使用iframe嵌入PDF文件，提供下载按钮，处理加载失败情况
 * 任务 11.4
 */
export function PDFViewer({ filePath, fileName }: PDFViewerProps) {
  const [loadError, setLoadError] = useState(false);

  // 处理下载
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <CardTitle>简历文件</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="size-4" />
            下载
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{fileName}</p>
          
          {loadError ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/30">
              <AlertCircle className="size-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground text-center mb-3">
                PDF 预览加载失败
              </p>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                下载查看
              </Button>
            </div>
          ) : (
            <iframe
              src={filePath}
              className="w-full h-[600px] border rounded-lg"
              title="PDF Preview"
              onError={() => setLoadError(true)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
