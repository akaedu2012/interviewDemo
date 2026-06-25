"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen min-w-[1280px] flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 渐变光晕 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto scrollbar-thin">
            <div className="container mx-auto py-6 px-4 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
