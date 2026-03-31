"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Task, Category } from "@/lib/types"
import { categoryColors } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  FileText,
  Code2,
  BookMarked,
  Target,
  CheckCircle2,
} from "lucide-react"

const categoryIcons: Record<Category, typeof BookOpen> = {
  Academic: BookOpen,
  Exams: FileText,
  Coding: Code2,
  Reading: BookMarked,
  Personal: Target,
  Completed: CheckCircle2,
}

interface CategorySummaryProps {
  tasks: Task[]
}

export function CategorySummary({ tasks }: CategorySummaryProps) {
  const categories: Category[] = [
    "Academic",
    "Exams",
    "Coding",
    "Reading",
    "Personal",
    "Completed",
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => {
        // "Completed" counts tasks where completed=true (any category)
        // Others count active (non-completed) tasks in that category
        const count =
          cat === "Completed"
            ? tasks.filter((t) => t.completed).length
            : tasks.filter((t) => t.category === cat && !t.completed).length

        const colors = categoryColors[cat]
        const Icon = categoryIcons[cat]

        return (
          <Card key={cat} className="border overflow-hidden transition-all hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
                  <Icon className={cn("size-5", colors.text)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cat}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
