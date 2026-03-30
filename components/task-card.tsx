"use client"

import { useState } from "react"
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

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => Promise<void> | void
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const catColor = categoryColors[task.category]
  const priColor = priorityColors[task.priority]

  // Local animation state: when checked, animate out before calling toggle
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  const handleComplete = async () => {
    // Only animate out when marking as complete (not unchecking)
    if (!task.completed) {
      setIsAnimatingOut(true)
      // Wait for animation to finish then call the actual toggle
      setTimeout(async () => {
        await onToggleComplete(task.id)
      }, 400)
    } else {
      // If unchecking from Completed tab, just toggle immediately
      await onToggleComplete(task.id)
    }
  }

  const deadlineDate = new Date(task.deadline)
  const isOverdue =
    isPast(deadlineDate) && !isToday(deadlineDate) && !task.completed
  const isDueToday = isToday(deadlineDate)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        isAnimatingOut && "opacity-0 scale-95 translate-x-2 pointer-events-none",
        task.completed && "opacity-60"
      )}
      style={{ transition: isAnimatingOut ? "all 0.4s ease" : undefined }}
    >
      {/* Category Accent Bar */}
      <div className={cn("absolute top-0 left-0 w-1 h-full", catColor.dot)} />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-3">

          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleComplete}
              aria-label={`Mark ${task.title} as ${
                task.completed ? "incomplete" : "complete"
              }`}
              className={cn(
                "transition-all duration-200",
                task.completed && "border-emerald-500 bg-emerald-500"
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "text-sm font-medium leading-snug text-card-foreground transition-all duration-200",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">

                {/* Edit — hide on completed tasks */}
                {!task.completed && (
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
                )}

                {/* Delete */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(task.id)}
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

              {/* Completed badge */}
              {task.completed && (
                <Badge
                  variant="outline"
                  className="text-[11px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  ✓ Done
                </Badge>
              )}

            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
