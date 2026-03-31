"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, LogOut, User, Zap, Timer } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav"
import { cn } from "@/lib/utils"

interface DashboardNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  focusScore?: number
  focusModeOn?: boolean
  focusTimerFmt?: string
  onToggleFocus?: () => void
}

export function DashboardNavbar({
  activeTab,
  onTabChange,
  focusScore = 0,
  focusModeOn = false,
  focusTimerFmt = "25:00",
  onToggleFocus,
}: DashboardNavbarProps) {
  const router = useRouter()

  const getTitle = () => {
    switch (activeTab) {
      case "all": return "Dashboard"
      case "Analytics": return "Analytics"
      case "Academic": return "Academic Tasks"
      case "Exams": return "Upcoming Exams"
      case "Coding": return "Coding Practice"
      case "Reading": return "Reading Reminder"
      case "Personal": return "Personal Tasks"
      case "PersonalWorkspace": return "Personal Workspace"
      case "Completed": return "Completed Tasks"
      default: return "Dashboard"
    }
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden size-9">
              <Menu className="size-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <DashboardMobileNav activeTab={activeTab} onTabChange={onTabChange} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold text-foreground">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Focus Score */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1">
          <Zap className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            {focusScore} pts
          </span>
        </div>

        {/* Focus mode toggle */}
        <Button
          variant={focusModeOn ? "default" : "outline"}
          size="sm"
          className={cn(
            "hidden sm:flex items-center gap-1.5 h-8 text-xs",
            focusModeOn && "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
          )}
          onClick={onToggleFocus}
        >
          <Timer className="size-3.5" />
          {focusModeOn ? focusTimerFmt : "Focus"}
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative size-9">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 rounded-full">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">AS</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem><User className="mr-2 size-4" />Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/")}><LogOut className="mr-2 size-4" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
