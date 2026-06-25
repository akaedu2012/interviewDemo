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
      <Card>
        <CardHeader>
          <CardTitle>工作经历</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无工作经历信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>工作经历</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary/50">
                  <Briefcase className="size-4 text-secondary-foreground" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">{exp.title}</h4>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.startDate} - {exp.endDate}
                </p>
                <p className="text-sm mt-2 leading-relaxed whitespace-pre-wrap">
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
