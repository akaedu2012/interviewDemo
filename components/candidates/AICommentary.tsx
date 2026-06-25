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
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Sparkles className="size-5 text-purple-400" />
          </div>
          <CardTitle className="text-xl text-cyan-300">AI 智能分析</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
            {commentary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
