import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface AICommentaryProps {
  commentary: string;
}

/**
 * AI评论展示组件
 * 格式化展示AI生成的评论文本
 * 任务 11.3
 */
export function AICommentary({ commentary }: AICommentaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <CardTitle>AI 智能分析</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {commentary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
