"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Home, Upload, Briefcase, Sparkles } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "首页",
      icon: Home,
    },
    {
      href: "/upload",
      label: "上传简历",
      icon: Upload,
    },
    {
      href: "/job-config",
      label: "岗位配置",
      icon: Briefcase,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 glass">
      {/* 顶部扫描线效果 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      
      <div className="container flex h-16 items-center px-4">
        {/* Logo区域 */}
        <Link href="/" className="mr-8 flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition-all" />
            <FileText className="h-7 w-7 text-cyan-400 relative z-10 group-hover:text-cyan-300 transition-colors" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
              AI 简历分析平台
            </span>
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          </div>
        </Link>
        
        {/* 导航区域 */}
        <nav className="flex items-center space-x-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center space-x-2 relative overflow-hidden transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70" 
                      : "hover:bg-white/5 hover:text-cyan-300"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 animate-pulse" />
                  )}
                  <Icon className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
        
        {/* 右侧装饰元素 */}
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-75" />
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse delay-150" />
        </div>
      </div>
      
      {/* 底部扫描线效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
    </header>
  );
}
