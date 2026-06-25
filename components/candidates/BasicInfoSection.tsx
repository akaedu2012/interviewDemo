import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, User } from "lucide-react";
import type { Candidate } from "@/types";

interface BasicInfoSectionProps {
  candidate: Candidate;
}

/**
 * 基本信息展示组件
 * 展示候选人的基本信息：姓名、电话、邮箱、城市
 * 任务 11.1
 */
export function BasicInfoSection({ candidate }: BasicInfoSectionProps) {
  return (
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl text-cyan-300">基本信息</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <User className="size-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">姓名</p>
              <p className="font-medium text-base text-slate-200">{candidate.name || "未提供"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Phone className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">电话</p>
              <p className="font-medium text-base text-slate-200">{candidate.phone || "未提供"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Mail className="size-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">邮箱</p>
              <p className="font-medium text-base text-slate-200">{candidate.email || "未提供"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <MapPin className="size-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">城市</p>
              <p className="font-medium text-base text-slate-200">{candidate.city || "未提供"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
