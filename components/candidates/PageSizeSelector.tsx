"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * PageSizeSelector - 每页数量选择器
 * 
 * 允许用户选择每页显示的记录数量
 */
export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
}: PageSizeSelectorProps) {
  const handleChange = (value: string | null) => {
    if (!value) return;
    onPageSizeChange(parseInt(value, 10));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">每页显示</span>
      <Select value={String(pageSize)} onValueChange={handleChange}>
        <SelectTrigger className="w-[80px] h-8 border-cyan-500/30 hover:border-cyan-500/50 text-slate-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 条</SelectItem>
          <SelectItem value="10">10 条</SelectItem>
          <SelectItem value="20">20 条</SelectItem>
          <SelectItem value="50">50 条</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
