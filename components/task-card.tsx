"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pencil, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { categoryColors, priorityColors } from "@/lib/types"
import { format, isPast, isToday } from "date-fns"
import { toast } from "sonner"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => Promise<void> | void
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const catColor = categoryColors[task.category]
  const priColor = priorityColors[task.priority]

  const deadlineDate = new Date(task.deadline)
  const isOverdue =
    isPast(deadlineDate) && !isToday(deadlineDate) && !task.completed
  const isDueToday = isToday(deadlineDate)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        task.completed && "opacity-60 bg-gray-50"
      )}
    >
      {/* Category Accent Bar */}
      <div className={cn("absolute top-0 left-0 w-1 h-full", catColor.dot)} />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-3">

          {/* ✅ FIXED CHECKBOX */}
          <div className="pt-0.5">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => {
                onToggleComplete(task.id)

                if (!task.completed) {
                  toast.success("Task completed! 🎉")
                } else {
                  toast.success("Marked incomplete")
                }
              }}
              aria-label={`Mark ${task.title} as ${
                task.completed ? "incomplete" : "complete"
              }`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "text-sm font-medium leading-snug text-card-foreground",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">

                {/* Edit */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onEdit(task)}
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit task</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Delete */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          onDelete(task.id)

                          toast("Task deleted", {
                            action: {
                              label: "Undo",
                              onClick: async () => {
                                await fetch("/api/tasks", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(task),
                                })
                                toast.success("Task restored")
                              },
                            },
                          })
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete task</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">

              {/* Priority */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] px-2 py-0 font-medium",
                  priColor,
                  task.priority === "High" && "ring-1 ring-red-400",
                  task.priority === "Medium" && "ring-1 ring-yellow-400"
                )}
              >
                {task.priority}
              </Badge>

              {/* Category */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] px-1.5 py-0",
                  catColor.bg,
                  catColor.text,
                  catColor.border
                )}
              >
                {task.category}
              </Badge>

              {/* Deadline */}
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  isOverdue
                    ? "text-red-600 font-semibold animate-pulse"
                    : isDueToday
                    ? "text-amber-500 font-medium"
                    : "text-muted-foreground"
                )}
              >
                <Calendar className="size-3" />
                {isOverdue
                  ? "Overdue"
                  : isDueToday
                  ? "Due today"
                  : format(deadlineDate, "MMM d")}
              </span>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
