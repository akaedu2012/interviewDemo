"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export interface CandidateSorterProps {
  sortBy: "score" | "uploadTime";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "score" | "uploadTime", sortOrder: "asc" | "desc") => void;
}

/**
 * CandidateSorter - 候选人排序选择器
 * 
 * 提供排序字段和排序顺序的选择
 */
export function CandidateSorter({
  sortBy,
  sortOrder,
  onSortChange,
}: CandidateSorterProps) {
  const currentValue = `${sortBy}-${sortOrder}`;

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    
    const [newSortBy, newSortOrder] = value.split("-") as [
      "score" | "uploadTime",
      "asc" | "desc"
    ];
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-cyan-400" />
      <Select value={currentValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] border-cyan-500/30 hover:border-cyan-500/50 text-slate-200">
          <SelectValue placeholder="选择排序方式" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="score-desc">分数从高到低</SelectItem>
            <SelectItem value="score-asc">分数从低到高</SelectItem>
            <SelectItem value="uploadTime-desc">最新上传</SelectItem>
            <SelectItem value="uploadTime-asc">最早上传</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
