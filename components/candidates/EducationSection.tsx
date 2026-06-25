import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { Education } from "@/types";

interface EducationSectionProps {
  education: Education[];
}

/**
 * 教育背景展示组件
 * 展示候选人的教育背景列表
 * 任务 11.1
 */
export function EducationSection({ education }: EducationSectionProps) {
  if (education.length === 0) {
    return (
      <Card className="glass-hover border border-cyan-500/20 ring-0">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl text-cyan-300">教育背景</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="text-sm text-slate-400">暂无教育背景信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl text-cyan-300">教育背景</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-5">
          {education.map((edu) => (
            <div key={edu.id} className="flex gap-4 pb-5 border-b border-slate-700/50 last:border-b-0 last:pb-0">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                  <GraduationCap className="size-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <h4 className="font-semibold text-base text-slate-200">{edu.school}</h4>
                <p className="text-sm text-slate-300">
                  {edu.degree} · {edu.major}
                </p>
                <p className="text-xs text-slate-400">{edu.graduationTime}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
