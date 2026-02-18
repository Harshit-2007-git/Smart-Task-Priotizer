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
import { Bell, Menu, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav"

interface DashboardNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardNavbar({ activeTab, onTabChange }: DashboardNavbarProps) {
  const router = useRouter()

  const getTitle = () => {
    switch (activeTab) {
      case "all":
        return "Dashboard"
      case "Analytics":
        return "Analytics"
      case "Academic":
        return "Academic Tasks"
      case "Exams":
        return "Upcoming Exams"
      case "Coding":
        return "Coding Practice"
      case "Reading":
        return "Reading Reminder"
      case "Personal":
        return "Personal Goals"
      case "Completed":
        return "Completed Tasks"
      default:
        return "Dashboard"
    }
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
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

      <div className="flex items-center gap-1">
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
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  AS
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/")}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
