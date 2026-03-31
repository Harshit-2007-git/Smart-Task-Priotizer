"use client"

import { useState } from "react"
import { useTasks } from "@/lib/task-context"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { TaskCard } from "@/components/task-card"
import { AddTaskModal } from "@/components/add-task-modal"
import { CategorySummary } from "@/components/category-summary"
import { AnalyticsSection } from "@/components/analytics-section"
import { PersonalWorkspace } from "@/components/personal-workspace"
import { FocusModeSection } from "@/components/focus-mode-section"
import { AIAssistantSection } from "@/components/ai-assistant-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Timer, Pause } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

function useFocusTimer() {
  const [active, setActive] = useState(false)
  const [seconds, setSeconds] = useState(25 * 60)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const start = () => {
    if (active) return
    setActive(true)
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id)
          setActive(false)
          toast.success("Focus session complete! 🎉 Take a break.")
          return 25 * 60
        }
        return s - 1
      })
    }, 1000)
    setIntervalId(id)
  }

  const pause = () => {
    if (intervalId) clearInterval(intervalId)
    setActive(false)
  }

  const reset = () => {
    if (intervalId) clearInterval(intervalId)
    setActive(false)
    setSeconds(25 * 60)
  }

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  return { active, fmt, start, pause, reset }
}

export function DashboardContent() {
  const { tasks, isLoading, focusScore, addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  const [activeTab, setActiveTab] = useState("all")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [focusModeOn, setFocusModeOn] = useState(false)
  const focus = useFocusTimer()

  const toggleFocusMode = () => {
    if (focusModeOn) {
      focus.pause()
      setFocusModeOn(false)
      toast.success("Focus mode off")
    } else {
      focus.start()
      setFocusModeOn(true)
      toast.success("Focus mode on — stay locked in! 🔒")
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "Completed") return task.completed && matchesSearch
    if (activeTab === "all") return !task.completed && matchesSearch
    return task.category === activeTab && !task.completed && matchesSearch
  })

  const handleAddOrUpdate = async (taskData: Omit<Task, "id" | "completed" | "createdAt">) => {
    if (editTask) {
      await updateTask(editTask.id, taskData)
      toast.success("Task updated successfully")
    } else {
      await addTask(taskData)
      toast.success("Task added successfully")
    }
    setEditTask(null)
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
    toast.success("Task deleted")
  }

  const handleEdit = (task: Task) => {
    setEditTask(task)
    setAddModalOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          focusScore={focusScore}
          focusModeOn={focusModeOn}
          focusTimerFmt={focus.fmt}
          onToggleFocus={toggleFocusMode}
        />

        {/* Focus mode banner — all interactions still work underneath */}
        {focusModeOn && (
          <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Focus mode active — {focus.fmt} remaining
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={focus.reset}>
                Reset
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={toggleFocusMode}>
                <Pause className="size-3 mr-1" />
                Pause
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <main className="p-4 lg:p-6 max-w-6xl mx-auto w-full">
            {activeTab === "Analytics" ? (
              <AnalyticsSection tasks={tasks} focusScore={focusScore} />
            ) : activeTab === "PersonalWorkspace" ? (
              <PersonalWorkspace />
            ) : activeTab === "FocusMode" ? (
              <FocusModeSection />
            ) : activeTab === "AIAssistant" ? (
              <AIAssistantSection />
            ) : (
              <div className="flex flex-col gap-6">
                {activeTab === "all" && <CategorySummary tasks={tasks} />}

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => { setEditTask(null); setAddModalOpen(true) }}>
                    <Plus className="mr-2 size-4" />
                    Add Task
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Search className="size-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery
                        ? "Try a different search term"
                        : activeTab === "Completed"
                        ? "Complete a task to see it here"
                        : "Click \"Add Task\" to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleComplete={toggleComplete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <AddTaskModal
        open={addModalOpen}
        onOpenChange={(open) => { setAddModalOpen(open); if (!open) setEditTask(null) }}
        onSubmit={handleAddOrUpdate}
        editTask={editTask}
      />
    </div>
  )
}
