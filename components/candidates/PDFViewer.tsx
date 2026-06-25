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
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <FileText className="size-5 text-blue-400" />
            </div>
            <CardTitle className="text-xl text-cyan-300">简历文件</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-300"
          >
            <Download className="size-4" />
            下载
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-4">
          <p className="text-xs text-slate-400">{fileName}</p>
          
          {loadError ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cyan-500/20 rounded-lg bg-slate-800/30">
              <AlertCircle className="size-12 text-slate-400 mb-3" />
              <p className="text-sm text-slate-300 text-center mb-3">
                PDF 预览加载失败
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-300"
              >
                <Download className="size-4 mr-2" />
                下载查看
              </Button>
            </div>
          ) : (
            <iframe
              src={filePath}
              className="w-full h-[600px] border border-cyan-500/20 rounded-lg bg-slate-900/50"
              title="PDF Preview"
              onError={() => setLoadError(true)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
