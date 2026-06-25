import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import type { Experience } from "@/types";

interface ExperienceSectionProps {
  experience: Experience[];
}

/**
 * 工作经历展示组件
 * 展示候选人的工作经历列表
 * 任务 11.1
 */
export function ExperienceSection({ experience }: ExperienceSectionProps) {
  if (experience.length === 0) {
    return (
      <Card className="glass-hover border border-cyan-500/20 ring-0">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl text-cyan-300">工作经历</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="text-sm text-slate-400">暂无工作经历信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl text-cyan-300">工作经历</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-5">
          {experience.map((exp) => (
            <div key={exp.id} className="flex gap-4 pb-5 border-b border-slate-700/50 last:border-b-0 last:pb-0">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Briefcase className="size-5 text-blue-400" />
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <h4 className="font-semibold text-base text-slate-200">{exp.title}</h4>
                <p className="text-sm text-slate-300">{exp.company}</p>
                <p className="text-xs text-slate-400">
                  {exp.startDate} - {exp.endDate}
                </p>
                <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap text-slate-300">
                  {exp.responsibilities}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
