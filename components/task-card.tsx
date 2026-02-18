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

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const catColor = categoryColors[task.category]
  const priColor = priorityColors[task.priority]
  const deadlineDate = new Date(task.deadline)
  const isOverdue = isPast(deadlineDate) && !isToday(deadlineDate) && !task.completed
  const isDueToday = isToday(deadlineDate)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md border",
        task.completed && "opacity-60"
      )}
    >
      {/* Category accent bar */}
      <div className={cn("absolute top-0 left-0 w-1 h-full", catColor.dot)} />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  "text-sm font-medium text-card-foreground leading-snug",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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

            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn("text-[11px] px-1.5 py-0", priColor)}
              >
                {task.priority}
              </Badge>

              <Badge
                variant="outline"
                className={cn("text-[11px] px-1.5 py-0", catColor.bg, catColor.text, catColor.border)}
              >
                {task.category}
              </Badge>

              <span
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  isOverdue
                    ? "text-red-500 font-medium"
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
