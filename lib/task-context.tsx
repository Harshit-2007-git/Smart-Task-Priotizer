"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Task, Category, Priority } from "./types"

interface TaskContextType {
  tasks: Task[]
  isLoading: boolean
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  getTasksByCategory: (category: Category) => Task[]
  getTasksByPriority: (priority: Priority) => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 🔥 GLOBAL fetchTasks (FIXED)
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(async (task: Omit<Task, "id" | "completed" | "createdAt">) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      })
      const data = await res.json()

      // 🔥 Refresh instead of manual update
      await fetchTasks()
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }, [fetchTasks])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH", // 🔥 FIXED (was PUT)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      await fetchTasks()
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }, [])

  const toggleComplete = useCallback(async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      const updatedCompleted = !task.completed

      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedCompleted,
        }),
      })

      if (!res.ok) {
        console.error("Failed to update task")
        return
      }

      // 🔥 THIS WAS MISSING PROPERLY
      await fetchTasks()

    } catch (error) {
      console.error("Toggle failed:", error)
    }
  }, [tasks, fetchTasks])

  const getTasksByCategory = useCallback(
    (category: Category) => tasks.filter((t) => t.category === category),
    [tasks]
  )

  const getTasksByPriority = useCallback(
    (priority: Priority) => tasks.filter((t) => t.priority === priority),
    [tasks]
  )

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        getTasksByCategory,
        getTasksByPriority,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
