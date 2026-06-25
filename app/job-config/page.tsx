"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/TagInput";
import { Notification } from "@/components/ui/Notification";
import { Save, Loader2 } from "lucide-react";
import { z } from "zod";

/**
 * 岗位配置表单页面
 * 实现岗位描述配置、表单验证和提交逻辑
 * 任务 12.1, 12.2
 */

// Zod schema for form validation
const jobConfigSchema = z.object({
  title: z.string().min(1, "岗位标题不能为空"),
  description: z.string().min(1, "岗位描述不能为空"),
  requiredSkills: z.array(z.string()).min(1, "至少需要一个必备技能"),
  preferredSkills: z.array(z.string()),
});

type JobConfigFormData = z.infer<typeof jobConfigSchema>;

export default function JobConfigPage() {
  const [formData, setFormData] = useState<JobConfigFormData>({
    title: "",
    description: "",
    requiredSkills: [],
    preferredSkills: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 页面加载时获取当前激活的岗位描述
  useEffect(() => {
    const fetchActiveJob = async () => {
      try {
        setIsFetching(true);
        const response = await fetch("/api/jobs/active");
        const data = await response.json();

        if (response.ok && data.success) {
          // 填充表单
          setFormData({
            title: data.data.title,
            description: data.data.description,
            requiredSkills: data.data.requiredSkills,
            preferredSkills: data.data.preferredSkills,
          });
        }
      } catch (error) {
        console.error("Failed to fetch active job:", error);
        // 如果没有激活的岗位，保持空表单
      } finally {
        setIsFetching(false);
      }
    };

    fetchActiveJob();
  }, []);

  // 验证表单
  const validateForm = (): boolean => {
    try {
      jobConfigSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!validateForm()) {
      Notification.error("表单验证失败", "请检查并修正错误后重试");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "保存失败");
      }

      Notification.success("保存成功", "岗位配置已更新");
    } catch (error) {
      console.error("Failed to save job config:", error);
      Notification.error(
        "保存失败",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse" />
            <div className="relative animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto" />
          </div>
          <p className="text-lg text-slate-300">加载岗位配置...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in">
      {/* 页面标题 */}
      <div className="glass-hover rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              岗位配置
            </h1>
            <p className="text-slate-400 mt-2">
              配置岗位描述、必备技能和加分技能，用于候选人智能匹配
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-hover border border-cyan-500/20 ring-0">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <CardTitle className="text-2xl text-cyan-300">岗位信息</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 岗位标题 */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base text-slate-200">
                岗位标题 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                placeholder="例如：高级全栈工程师"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                aria-invalid={!!errors.title}
                className="text-base h-12 border-slate-600 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/50"
              />
              {errors.title && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* 岗位描述 */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base text-slate-200">
                岗位描述 <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="负责开发和维护核心 Web 应用，熟悉Vue.js、React.js、Next.js、Nuxt.js，后端架构采用Java、Python、Go等web框架..."
                rows={10}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                aria-invalid={!!errors.description}
                className="text-base border-slate-600 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/50 resize-none"
              />
              {errors.description && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.description}
                </p>
              )}
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-cyan-500" />
                详细描述岗位要求，AI 将根据此描述进行候选人匹配
              </p>
            </div>

            {/* 必备技能 */}
            <div className="space-y-3">
              <Label htmlFor="requiredSkills" className="text-base text-slate-200">
                必备技能 <span className="text-red-400">*</span>
              </Label>
              <TagInput
                id="requiredSkills"
                value={formData.requiredSkills}
                onChange={(tags) =>
                  setFormData({ ...formData, requiredSkills: tags })
                }
                placeholder="输入技能名称后按回车添加"
                className="min-h-[56px] border-slate-600 bg-slate-800/50 focus-within:border-cyan-500 focus-within:ring-cyan-500/50"
                tagClassName="bg-cyan-600 text-white border-cyan-500 font-medium px-3 py-1.5 text-sm hover:bg-cyan-700 transition-colors"
              />
              {errors.requiredSkills && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.requiredSkills}
                </p>
              )}
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-cyan-500" />
                候选人必须具备的核心技能（至少添加 1 个）
              </p>
            </div>

            {/* 加分技能 */}
            <div className="space-y-3">
              <Label htmlFor="preferredSkills" className="text-base text-slate-200">
                加分技能
              </Label>
              <TagInput
                id="preferredSkills"
                value={formData.preferredSkills}
                onChange={(tags) =>
                  setFormData({ ...formData, preferredSkills: tags })
                }
                placeholder="输入技能名称后按回车添加"
                className="min-h-[56px] border-slate-600 bg-slate-800/50 focus-within:border-cyan-500 focus-within:ring-cyan-500/50"
                tagClassName="bg-purple-600 text-white border-purple-500 font-medium px-3 py-1.5 text-sm hover:bg-purple-700 transition-colors"
              />
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-cyan-500" />
                候选人具备会加分的技能（可选）
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    title: "",
                    description: "",
                    requiredSkills: [],
                    preferredSkills: [],
                  });
                  setErrors({});
                }}
                disabled={isLoading}
                className="h-11 px-6 border-slate-600 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
              >
                清空表单
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="h-11 px-6 gap-2 btn-glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="size-5" />
                    保存配置
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
