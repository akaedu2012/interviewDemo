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
    <Card>
      <CardHeader>
        <CardTitle>基本信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <User className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">姓名</p>
              <p className="font-medium">{candidate.name || "未提供"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">电话</p>
              <p className="font-medium">{candidate.phone || "未提供"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">邮箱</p>
              <p className="font-medium">{candidate.email || "未提供"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">城市</p>
              <p className="font-medium">{candidate.city || "未提供"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
