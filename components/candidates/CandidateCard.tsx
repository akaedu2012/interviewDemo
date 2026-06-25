"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateStatus } from "@/types";

export interface CandidateCardItem {
  id: string;
  name: string | null;
  overallScore?: number;
  status: CandidateStatus;
  createdAt: string; // ISO string from API
}

export interface CandidateCardProps {
  candidate: CandidateCardItem;
}

const statusColors: Record<CandidateStatus, string> = {
  待筛选: "bg-slate-700 text-white border-slate-600",
  初筛通过: "bg-blue-600 text-white border-blue-500",
  面试中: "bg-purple-600 text-white border-purple-500",
  已录用: "bg-cyan-600 text-white border-cyan-500",
  已淘汰: "bg-red-600 text-white border-red-500",
};

/**
 * CandidateCard - 候选人卡片视图组件
 * 
 * 以卡片形式显示候选人摘要信息
 */
export function CandidateCard({ candidate }: CandidateCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/candidates/${candidate.id}`);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "text-slate-400";
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  };

  const getScoreBg = (score?: number) => {
    if (score === undefined) return "bg-slate-500/10 border-slate-500/30";
    if (score >= 80) return "score-bg-high";
    if (score >= 60) return "score-bg-medium";
    return "score-bg-low";
  };

  return (
    <Card
      className="glass-hover cursor-pointer border-cyan-500/20 card-hover group relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* 顶部光效 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-500 transition-all duration-300" />
      
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-3 text-lg group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-lg group-hover:bg-cyan-500/30 transition-all" />
              <User className="h-5 w-5 text-cyan-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-slate-200 group-hover:text-cyan-300 transition-colors">
              {candidate.name || "未知"}
            </span>
          </CardTitle>
          <Badge 
            className={cn(
              "px-3 py-1.5 text-xs font-bold relative z-20 shadow-xl border-2 opacity-100",
              statusColors[candidate.status]
            )} 
            variant="secondary"
            style={{ backgroundColor: 'rgb(var(--badge-bg, 71 85 105))', color: 'white' }}
          >
            {candidate.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        {/* 评分显示 */}
        <div className={cn(
          "rounded-lg p-4 border transition-all duration-300",
          getScoreBg(candidate.overallScore)
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300">匹配分数</span>
            </div>
            {candidate.overallScore !== undefined ? (
              <div className="flex items-center gap-2">
                <span className={cn("text-3xl font-bold", getScoreColor(candidate.overallScore))}>
                  {candidate.overallScore.toFixed(1)}
                </span>
                {candidate.overallScore >= 80 && (
                  <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
                )}
              </div>
            ) : (
              <span className="text-sm text-slate-500">未评分</span>
            )}
          </div>
          
          {/* 分数进度条 */}
          {candidate.overallScore !== undefined && (
            <div className="mt-3 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  candidate.overallScore >= 80 ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
                  candidate.overallScore >= 60 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                  "bg-gradient-to-r from-red-500 to-pink-500"
                )}
                style={{ width: `${candidate.overallScore}%` }}
              />
            </div>
          )}
        </div>
        
        {/* 创建时间 */}
        <div className="flex items-center gap-2 text-sm text-slate-400 pt-2 border-t border-slate-700/50">
          <Calendar className="h-4 w-4 text-cyan-500/70" />
          <span>{formatDate(candidate.createdAt)}</span>
        </div>
      </CardContent>
      
      {/* 底部光效 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/50 transition-all duration-300" />
    </Card>
  );
}
