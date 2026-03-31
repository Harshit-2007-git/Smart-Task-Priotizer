"use client"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Zap, LayoutDashboard, BookOpen, FileText, Code2,
  BookMarked, Target, CheckCircle2, BarChart3, Heart,
} from "lucide-react"

const sidebarLinks = [
  { label: "Dashboard", tab: "all", icon: LayoutDashboard },
  { label: "Academic Tasks", tab: "Academic", icon: BookOpen, dot: "bg-red-500" },
  { label: "Upcoming Exams", tab: "Exams", icon: FileText, dot: "bg-orange-500" },
  { label: "Coding Practice", tab: "Coding", icon: Code2, dot: "bg-blue-500" },
  { label: "Reading", tab: "Reading", icon: BookMarked, dot: "bg-emerald-500" },
  { label: "Personal Tasks", tab: "Personal", icon: Target, dot: "bg-purple-500" },
  { label: "Completed", tab: "Completed", icon: CheckCircle2, dot: "bg-gray-500" },
  { label: "Analytics", tab: "Analytics", icon: BarChart3 },
  { label: "Personal Workspace", tab: "PersonalWorkspace", icon: Heart, dot: "bg-pink-500" },
]

interface DashboardMobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardMobileNav({ activeTab, onTabChange }: DashboardMobileNavProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center gap-2 h-14 px-4 border-b border-sidebar-border">
        <div className="size-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Zap className="size-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground">Task Prioritizer</span>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = link.tab === activeTab
            return (
              <button
                key={link.label}
                onClick={() => onTabChange(link.tab)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div className="relative shrink-0">
                  <link.icon className="size-4" />
                  {link.dot && (
                    <span className={cn("absolute -top-0.5 -right-0.5 size-2 rounded-full", link.dot)} />
                  )}
                </div>
                <span>{link.label}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
