"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Task, Category, Priority } from "./types"

interface TaskContextType {
  tasks: Task[]
  isLoading: boolean
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => void
  getTasksByCategory: (category: Category) => Task[]
  getTasksByPriority: (priority: Priority) => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks")
        const data = await res.json()
        setTasks(data.tasks)
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const addTask = useCallback(async (task: Omit<Task, "id" | "completed" | "createdAt">) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      })
      const data = await res.json()
      setTasks((prev) => [...prev, data.task])
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }, [])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      )
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }, [])

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed
          return {
            ...t,
            completed,
            category: completed ? "Completed" : t.category,
          }
        }
        return t
      })
    )
  }, [])

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
