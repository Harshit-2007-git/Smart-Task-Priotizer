"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Category } from "@/lib/types"
import { categoryColors } from "@/lib/types"
import { Flame, Trophy, TrendingUp } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const PIE_COLORS = [
  "#ef4444",
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#6b7280",
]

interface AnalyticsSectionProps {
  tasks: Task[]
}

export function AnalyticsSection({ tasks }: AnalyticsSectionProps) {
  const [focusScore, setFocusScore] = useState(0)

  // Load focus score from localStorage (set by Focus Mode)
  useEffect(() => {
    const stored = localStorage.getItem("focusScore")
    if (stored) setFocusScore(parseInt(stored))
  }, [])

  const categories: Category[] = [
    "Academic",
    "Exams",
    "Coding",
    "Reading",
    "Personal",
    "Completed",
  ]

  const pieData = categories
    .map((cat, idx) => ({
      name: cat,
      value: tasks.filter((t) => t.category === cat).length,
      color: PIE_COLORS[idx],
    }))
    .filter((d) => d.value > 0)

  const barData = [
    { day: "Mon", completed: 2, added: 3 },
    { day: "Tue", completed: 1, added: 2 },
    { day: "Wed", completed: 3, added: 1 },
    { day: "Thu", completed: 2, added: 4 },
    { day: "Fri", completed: 4, added: 2 },
    { day: "Sat", completed: 1, added: 1 },
    { day: "Sun", completed: 0, added: 2 },
  ]

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const productivityScore =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (productivityScore / 100) * circumference

  // Focus score tier
  const focusTier =
    focusScore >= 200
      ? { label: "Legend", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" }
      : focusScore >= 100
      ? { label: "Expert", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" }
      : focusScore >= 50
      ? { label: "Focused", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" }
      : { label: "Beginner", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }

  return (
    <div className="flex flex-col gap-6">

      {/* Focus Score Card — NEW */}
      <Card className={`border ${focusTier.bg}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative size-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse" />
                <div className="relative flex flex-col items-center">
                  <Flame className="size-5 text-orange-400 mb-0.5" />
                  <span className="text-4xl font-bold text-foreground">{focusScore}</span>
                  <span className="text-xs text-muted-foreground">Focus Score</span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${focusTier.bg} ${focusTier.color}`}>
                <Trophy className="size-3" />
                {focusTier.label}
              </div>
            </div>

            {/* Score Info */}
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">Your Focus Score</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Earned by completing focus sessions in Focus Mode. High priority tasks give more points!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-center">
                  <p className="text-xs text-muted-foreground">High Priority</p>
                  <p className="text-sm font-bold text-red-400">+5 pts/5min</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-center">
                  <p className="text-xs text-muted-foreground">Medium Priority</p>
                  <p className="text-sm font-bold text-amber-400">+3 pts/5min</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                  <p className="text-xs text-muted-foreground">Low Priority</p>
                  <p className="text-sm font-bold text-emerald-400">+1 pt/5min</p>
                </div>
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-2 text-center">
                  <p className="text-xs text-muted-foreground">Pausing</p>
                  <p className="text-sm font-bold text-orange-400">-2 pts</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="added" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Added" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="transform -rotate-90" width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r={radius} strokeWidth="12" fill="none" className="stroke-muted" />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
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
                <p className="text-2xl font-bold text-amber-500">
                  {tasks.filter((t) => t.priority === "High" && !t.completed).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">High Priority</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {tasks.filter((t) => !t.completed).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Remaining</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
