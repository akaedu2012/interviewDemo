"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Upload, Briefcase, Zap, Activity } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "候选人列表",
      icon: Home,
      description: "查看所有候选人",
    },
    {
      href: "/upload",
      label: "上传简历",
      icon: Upload,
      description: "智能解析简历",
    },
    {
      href: "/job-config",
      label: "岗位配置",
      icon: Briefcase,
      description: "管理招聘岗位",
    },
  ];

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-cyan-500/20 glass relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="p-6 relative z-10">
        {/* 导航标题 */}
        <div className="mb-6 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            导航菜单
          </h2>
        </div>
        
        {/* 导航列表 */}
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-lg transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" 
                      : "hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
                  )}
                >
                  {/* 激活状态的扫描线 */}
                  {isActive && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
                    </div>
                  )}
                  
                  <div className="p-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "relative",
                        isActive && "animate-pulse"
                      )}>
                        {isActive && (
                          <div className="absolute inset-0 bg-cyan-500/30 blur-lg" />
                        )}
                        <Icon className={cn(
                          "h-5 w-5 relative z-10 transition-colors",
                          isActive ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-400"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium transition-colors",
                          isActive ? "text-cyan-300" : "text-slate-300 group-hover:text-cyan-300"
                        )}>
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* 底部信息卡片 */}
      <div className="mt-auto p-6 border-t border-cyan-500/20 relative z-10">
        <div className="glass-hover rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
            <p className="font-medium text-cyan-300">系统状态</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">AI模型</span>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-slate-300">在线</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">数据库</span>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-slate-300">已连接</span>
              </div>
            </div>
          </div>
          
          {/* 版本信息 */}
          <div className="pt-3 mt-3 border-t border-cyan-500/10">
            <p className="text-xs text-slate-500">
              AI 简历分析平台 v1.0
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Powered by DeepSeek AI
            </p>
          </div>
        </div>
      </div>
      
      {/* 右侧边框光效 */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
    </aside>
  );
}
