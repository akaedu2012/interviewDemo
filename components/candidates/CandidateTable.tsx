"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateStatus } from "@/types";

export interface CandidateTableItem {
  id: string;
  name: string | null;
  overallScore?: number;
  status: CandidateStatus;
  createdAt: string; // ISO string from API
}

export interface CandidateTableProps {
  candidates: CandidateTableItem[];
  sortBy?: "score" | "uploadTime";
  sortOrder?: "asc" | "desc";
  onSort?: (field: "score" | "uploadTime") => void;
}

const statusColors: Record<CandidateStatus, string> = {
  待筛选: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  初筛通过: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  面试中: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  已录用: "bg-green-100 text-green-800 hover:bg-green-200",
  已淘汰: "bg-red-100 text-red-800 hover:bg-red-200",
};

/**
 * CandidateTable - 候选人表格视图组件
 * 
 * 显示候选人列表，支持列排序和行点击导航
 */
export function CandidateTable({
  candidates,
  sortBy,
  sortOrder,
  onSort,
}: CandidateTableProps) {
  const router = useRouter();

  const handleRowClick = (candidateId: string) => {
    router.push(`/candidates/${candidateId}`);
  };

  const handleSort = (field: "score" | "uploadTime") => {
    if (onSort) {
      onSort(field);
    }
  };

  const renderSortIcon = (field: "score" | "uploadTime") => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">姓名</TableHead>
          <TableHead
            className={cn(
              "w-[120px] cursor-pointer select-none",
              onSort && "hover:bg-muted/50"
            )}
            onClick={() => handleSort("score")}
          >
            <div className="flex items-center">
              总分
              {renderSortIcon("score")}
            </div>
          </TableHead>
          <TableHead
            className={cn(
              "w-[180px] cursor-pointer select-none",
              onSort && "hover:bg-muted/50"
            )}
            onClick={() => handleSort("uploadTime")}
          >
            <div className="flex items-center">
              上传时间
              {renderSortIcon("uploadTime")}
            </div>
          </TableHead>
          <TableHead className="w-[120px]">状态</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              暂无候选人数据
            </TableCell>
          </TableRow>
        ) : (
          candidates.map((candidate) => (
            <TableRow
              key={candidate.id}
              onClick={() => handleRowClick(candidate.id)}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                {candidate.name || "未知"}
              </TableCell>
              <TableCell>
                {candidate.overallScore !== undefined ? (
                  <span
                    className={cn(
                      "font-semibold",
                      candidate.overallScore >= 80
                        ? "text-green-600"
                        : candidate.overallScore >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    )}
                  >
                    {candidate.overallScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(candidate.createdAt)}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[candidate.status]} variant="secondary">
                  {candidate.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
