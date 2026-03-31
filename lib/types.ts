export type Priority = "High" | "Medium" | "Low" | "Daily"

export type Category =
  | "Academic"
  | "Exams"
  | "Coding"
  | "Reading"
  | "Personal"
  | "Completed"

export interface Task {
  id: string
  title: string
  description: string
  category: Category
  priority: Priority
  deadline: string
  completed: boolean
  createdAt: string
}

export const categoryColors: Record<Category, { bg: string; text: string; border: string; dot: string }> = {
  Academic: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/20", dot: "bg-red-500" },
  Exams: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20", dot: "bg-orange-500" },
  Coding: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20", dot: "bg-blue-500" },
  Reading: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  Personal: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20", dot: "bg-purple-500" },
  Completed: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/20", dot: "bg-gray-500" },
}

export const priorityColors: Record<Priority, string> = {
  High: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
  Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
  Low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  Daily: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/25",
}

// Returns true if this task should affect the focus score
export function affectsFocusScore(task: Task): boolean {
  return task.category !== "Personal" && task.priority !== "Daily"
}
