"use client"

import { useState } from "react"
import { useTasks } from "@/lib/task-context"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { TaskCard } from "@/components/task-card"
import { AddTaskModal } from "@/components/add-task-modal"
import { CategorySummary } from "@/components/category-summary"
import { AnalyticsSection } from "@/components/analytics-section"
import { FocusModeSection } from "@/components/focus-mode-section"
import { AIAssistantSection } from "@/components/ai-assistant-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Task } from "@/lib/types"

export function DashboardContent() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } =
    useTasks()

  const [activeTab, setActiveTab] = useState("all")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "Completed") {
      return task.completed && matchesSearch
    }

    if (activeTab !== "all") {
      return !task.completed && task.category === activeTab && matchesSearch
    }

    return !task.completed && matchesSearch
  })

  const handleAddOrUpdate = async (
    taskData: Omit<Task, "id" | "completed" | "createdAt">
  ) => {
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

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    // ✅ FIX: removed overflow-hidden so the page can scroll naturally
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col">
        {/* Sticky navbar */}
        <div className="sticky top-0 z-10">
          <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto w-full">

            {activeTab === "Analytics" ? (
              <AnalyticsSection tasks={tasks} />

            ) : activeTab === "FocusMode" ? (
              <FocusModeSection />

            ) : activeTab === "AIAssistant" ? (
              <AIAssistantSection />

            ) : (
              <div className="flex flex-col gap-6">

                {activeTab === "all" && <CategorySummary tasks={tasks} />}

                {activeTab === "Completed" && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-500" />
                      <h2 className="text-lg font-semibold text-foreground">
                        Completed Tasks
                      </h2>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {completedCount} task{completedCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

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
                  {activeTab !== "Completed" && (
                    <Button
                      onClick={() => {
                        setEditTask(null)
                        setAddModalOpen(true)
                      }}
                    >
                      <Plus className="mr-2 size-4" />
                      Add Task
                    </Button>
                  )}
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
                      {activeTab === "Completed" ? (
                        <CheckCircle2 className="size-6 text-muted-foreground" />
                      ) : (
                        <Search className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      {activeTab === "Completed"
                        ? "No completed tasks yet"
                        : "No tasks found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === "Completed"
                        ? "Complete a task by checking the checkbox on any task card"
                        : searchQuery
                        ? "Try a different search term"
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
          </div>
        </main>
      </div>

      <AddTaskModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open)
          if (!open) setEditTask(null)
        }}
        onSubmit={handleAddOrUpdate}
        editTask={editTask}
      />
    </div>
  )
}
