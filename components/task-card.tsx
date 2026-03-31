"use client"

import { useState, useEffect } from "react"
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

  const [visible, setVisible] = useState(false)
  const [animatingOut, setAnimatingOut] = useState(false)

  // Mount animation — fade in on load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleComplete = async () => {
    if (!task.completed) {
      // Animate out first, then call toggle
      setAnimatingOut(true)
      setTimeout(async () => {
        await onToggleComplete(task.id)
      }, 350)
    } else {
      await onToggleComplete(task.id)
    }
  }

  const deadlineDate = task.deadline ? new Date(task.deadline) : null
  const isOverdue =
    deadlineDate ? isPast(deadlineDate) && !isToday(deadlineDate) && !task.completed : false
  const isDueToday = deadlineDate ? isToday(deadlineDate) : false

  return (
    <div
      style={{
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: animatingOut ? 0 : visible ? 1 : 0,
        transform: animatingOut
          ? "scale(0.92) translateY(-6px)"
          : visible
          ? "scale(1) translateY(0)"
          : "scale(0.96) translateY(4px)",
      }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border hover:shadow-lg hover:-translate-y-0.5 transition-shadow duration-200",
          task.completed && "opacity-70"
        )}
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
                  "transition-colors duration-200",
                  task.completed && "border-emerald-500 data-[state=checked]:bg-emerald-500"
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

                {deadlineDate && (
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
                )}

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
    </div>
  )
}
