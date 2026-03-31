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
  focusScore: number
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  getTasksByCategory: (category: Category) => Task[]
  getTasksByPriority: (priority: Priority) => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

function loadFocusScore(): number {
  if (typeof window === "undefined") return 0
  const stored = localStorage.getItem("focusScore")
  return stored ? parseInt(stored, 10) : 0
}

function saveFocusScore(score: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem("focusScore", String(score))
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [focusScore, setFocusScore] = useState(0)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      const fetched: Task[] = data.tasks || []
      setTasks(fetched)

      // Seed focus score from DB on first load, take max of stored vs DB-derived
      const scorableDone = fetched.filter(
        (t) => t.completed && t.category !== "Personal" && t.priority !== "Daily"
      )
      const scoreFromDB = scorableDone.length * 10
      const stored = loadFocusScore()
      const best = Math.max(stored, scoreFromDB)
      setFocusScore(best)
      saveFocusScore(best)
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
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      })
      await fetchTasks()
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }, [fetchTasks])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
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
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newCompleted = !task.completed

    // 1. Optimistic update immediately
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    )

    // 2. PATCH the DB
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newCompleted }),
    })

    if (!res.ok) {
      // 3. Rollback on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t))
      )
      console.error("PATCH failed — rolled back")
      return
    }

    // 4. Update focus score if task qualifies
    const qualifies = task.category !== "Personal" && task.priority !== "Daily"
    if (qualifies) {
      setFocusScore((prev) => {
        const next = newCompleted ? prev + 10 : Math.max(0, prev - 10)
        saveFocusScore(next)
        return next
      })
    }

    // 5. Background sync (non-blocking)
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(() => {})
  }, [tasks])

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
        focusScore,
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
