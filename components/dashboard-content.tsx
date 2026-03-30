"use client"

import { useState } from "react"
import { useTasks } from "@/lib/task-context"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { TaskCard } from "@/components/task-card"
import { AddTaskModal } from "@/components/add-task-modal"
import { CategorySummary } from "@/components/category-summary"
import { AnalyticsSection } from "@/components/analytics-section"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Task, Category } from "@/lib/types"

export function DashboardContent() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } =
    useTasks()
  const [activeTab, setActiveTab] = useState("all")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = tasks.filter((task) => {
  // 🔥 Handle completed tab separately
  const matchesCompletion =
    activeTab === "Completed"
      ? task.completed
      : !task.completed

  const matchesTab =
    activeTab === "all" ||
    activeTab === "Completed" ||
    task.category === activeTab

  const matchesSearch =
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())

  return matchesCompletion && matchesTab && matchesSearch
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />

        <ScrollArea className="flex-1">
          <main className="p-4 lg:p-6 max-w-6xl mx-auto w-full">
            {activeTab === "Analytics" ? (
              <AnalyticsSection tasks={tasks} />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Summary Cards - only on "all" tab */}
                {activeTab === "all" && <CategorySummary tasks={tasks} />}

                {/* Search + Add */}
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
                  <Button
                    onClick={() => {
                      setEditTask(null)
                      setAddModalOpen(true)
                    }}
                  >
                    <Plus className="mr-2 size-4" />
                    Add Task
                  </Button>
                </div>

                {/* Task List */}
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
                    <h3 className="text-lg font-medium text-foreground">
                      No tasks found
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery
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
          </main>
        </ScrollArea>
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
