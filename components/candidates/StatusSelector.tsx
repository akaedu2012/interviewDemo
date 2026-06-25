"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Notification } from "@/components/ui/Notification";
import type { CandidateStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface StatusSelectorProps {
  candidateId: string;
  currentStatus: CandidateStatus;
  onStatusChange?: (newStatus: CandidateStatus) => void;
}

// 状态选项配置
const STATUS_OPTIONS: Array<{
  value: CandidateStatus;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}> = [
  { value: "待筛选", label: "待筛选", variant: "outline" },
  { value: "初筛通过", label: "初筛通过", variant: "secondary" },
  { value: "面试中", label: "面试中", variant: "default" },
  { value: "已录用", label: "已录用", variant: "default" },
  { value: "已淘汰", label: "已淘汰", variant: "destructive" },
];

/**
 * 状态选择器组件
 * 使用 shadcn/ui Select 组件实现状态下拉选择器
 * 状态改变时调用 API 更新，显示加载状态和成功/失败反馈
 * 任务 11.3
 */
export function StatusSelector({
  candidateId,
  currentStatus,
  onStatusChange,
}: StatusSelectorProps) {
  const [status, setStatus] = useState<CandidateStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    
    const newStatusValue = newStatus as CandidateStatus;
    
    // 如果状态没有变化，直接返回
    if (newStatusValue === status) {
      return;
    }

    setIsLoading(true);

    try {
      // 调用 API 更新状态
      const response = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatusValue }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "更新状态失败");
      }

      // 更新本地状态
      setStatus(newStatusValue);

      // 显示成功通知
      Notification.success("状态更新成功", `候选人状态已更新为：${newStatusValue}`);

      // 调用回调函数
      if (onStatusChange) {
        onStatusChange(newStatusValue);
      }
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      
      // 显示错误通知
      Notification.error(
        "状态更新失败",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">招聘状态</label>
      <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {currentOption && (
              <Badge variant={currentOption.variant} className="text-xs">
                {currentOption.label}
              </Badge>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <Badge variant={option.variant} className="text-xs">
                {option.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <p className="text-xs text-muted-foreground">正在更新状态...</p>
      )}
    </div>
  );
}
