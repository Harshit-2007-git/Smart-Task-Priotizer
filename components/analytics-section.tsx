"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Category } from "@/lib/types"
import { affectsFocusScore } from "@/lib/types"
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"
import { Zap } from "lucide-react"

const PIE_COLORS = ["#ef4444","#f97316","#3b82f6","#10b981","#a855f7","#6b7280"]

interface AnalyticsSectionProps {
  tasks: Task[]
  focusScore?: number
}

export function AnalyticsSection({ tasks, focusScore = 0 }: AnalyticsSectionProps) {
  const categories: Category[] = ["Academic","Exams","Coding","Reading","Personal","Completed"]

  const pieData = categories
    .map((cat, idx) => ({
      name: cat,
      value: cat === "Completed"
        ? tasks.filter((t) => t.completed).length
        : tasks.filter((t) => t.category === cat && !t.completed).length,
      color: PIE_COLORS[idx],
    }))
    .filter((d) => d.value > 0)

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  const barData = days.map((day, i) => {
    const dayTasks = tasks.filter((t) => new Date(t.createdAt).getDay() === i)
    return { day, completed: dayTasks.filter((t) => t.completed).length, added: dayTasks.length }
  })

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const scorableCompleted = tasks.filter((t) => t.completed && affectsFocusScore(t)).length

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (productivityScore / 100) * circumference

  return (
    <div className="flex flex-col gap-6">
      {/* Focus Score card */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Zap className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Focus Score</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{focusScore} pts</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Earned from {scorableCompleted} qualifying tasks (excludes Personal & Daily)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                  <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4,4,0,0]} name="Completed" />
                  <Bar dataKey="added" fill="#3b82f6" radius={[4,4,0,0]} name="Added" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">Productivity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="transform -rotate-90" width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={radius} strokeWidth="12" fill="none" className="stroke-muted" />
                <circle cx="90" cy="90" r={radius} strokeWidth="12" fill="none" strokeLinecap="round"
                  className="stroke-primary transition-all duration-700"
                  style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">{productivityScore}%</span>
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-emerald-500">{completedTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{tasks.filter((t) => t.priority === "High" && !t.completed).length}</p>
                <p className="text-xs text-muted-foreground mt-1">High Priority</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">{tasks.filter((t) => !t.completed).length}</p>
                <p className="text-xs text-muted-foreground mt-1">Remaining</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
