"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, TrendingUp } from "lucide-react";
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
  待筛选: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  初筛通过: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  面试中: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  已录用: "bg-green-100 text-green-800 hover:bg-green-200",
  已淘汰: "bg-red-100 text-red-800 hover:bg-red-200",
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
    if (score === undefined) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            {candidate.name || "未知"}
          </CardTitle>
          <Badge className={statusColors[candidate.status]} variant="secondary">
            {candidate.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>匹配分数</span>
          </div>
          {candidate.overallScore !== undefined ? (
            <span className={cn("text-2xl font-bold", getScoreColor(candidate.overallScore))}>
              {candidate.overallScore.toFixed(1)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">未评分</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(candidate.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
