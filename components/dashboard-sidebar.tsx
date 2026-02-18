"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Code2,
  BookMarked,
  Target,
  CheckCircle2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Academic Tasks", href: "/dashboard?tab=Academic", icon: BookOpen, dot: "bg-red-500" },
  { label: "Upcoming Exams", href: "/dashboard?tab=Exams", icon: FileText, dot: "bg-orange-500" },
  { label: "Coding Practice", href: "/dashboard?tab=Coding", icon: Code2, dot: "bg-blue-500" },
  { label: "Reading", href: "/dashboard?tab=Reading", icon: BookMarked, dot: "bg-emerald-500" },
  { label: "Personal Goals", href: "/dashboard?tab=Personal", icon: Target, dot: "bg-purple-500" },
  { label: "Completed", href: "/dashboard?tab=Completed", icon: CheckCircle2, dot: "bg-gray-500" },
  { label: "Analytics", href: "/dashboard?tab=Analytics", icon: BarChart3 },
]

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 h-14 px-4 border-b border-sidebar-border shrink-0">
        <div className="size-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Zap className="size-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-sidebar-foreground truncate">
            Task Prioritizer
          </span>
        )}
      </div>

      {/* Nav Links */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive =
              (link.label === "Dashboard" && activeTab === "all") ||
              (link.href.includes("tab=") &&
                link.href.split("tab=")[1] === activeTab)

            return (
              <button
                key={link.label}
                onClick={() => {
                  if (link.label === "Dashboard") {
                    onTabChange("all")
                  } else if (link.href.includes("tab=")) {
                    onTabChange(link.href.split("tab=")[1])
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div className="relative shrink-0">
                  <link.icon className="size-4" />
                  {link.dot && (
                    <span
                      className={cn(
                        "absolute -top-0.5 -right-0.5 size-2 rounded-full",
                        link.dot
                      )}
                    />
                  )}
                </div>
                {!collapsed && <span className="truncate">{link.label}</span>}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}
