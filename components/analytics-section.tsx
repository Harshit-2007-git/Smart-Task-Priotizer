"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Category } from "@/lib/types"
import { categoryColors } from "@/lib/types"
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
  "#ef4444", // Academic - red
  "#f97316", // Exams - orange
  "#3b82f6", // Coding - blue
  "#10b981", // Reading - emerald
  "#a855f7", // Personal - purple
  "#6b7280", // Completed - gray
]

interface AnalyticsSectionProps {
  tasks: Task[]
}

export function AnalyticsSection({ tasks }: AnalyticsSectionProps) {
  // Pie chart: task distribution by category
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

  // Bar chart: tasks completed this week (dummy data for visual appeal)
  const barData = [
    { day: "Mon", completed: 2, added: 3 },
    { day: "Tue", completed: 1, added: 2 },
    { day: "Wed", completed: 3, added: 1 },
    { day: "Thu", completed: 2, added: 4 },
    { day: "Fri", completed: 4, added: 2 },
    { day: "Sat", completed: 1, added: 1 },
    { day: "Sun", completed: 0, added: 2 },
  ]

  // Productivity score
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const productivityScore =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // SVG circle metrics
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (productivityScore / 100) * circumference

  return (
    <div className="flex flex-col gap-6">
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
                      <span className="text-xs text-muted-foreground">
                        {value}
                      </span>
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
                      <span className="text-xs text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                  <Bar
                    dataKey="added"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Added"
                  />
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
            {/* Circular Progress */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg
                className="transform -rotate-90"
                width="180"
                height="180"
                viewBox="0 0 180 180"
              >
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  strokeWidth="12"
                  fill="none"
                  className="stroke-muted"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  className="stroke-primary transition-all duration-700"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground">
                  {productivityScore}%
                </span>
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
            </div>

            {/* Stats */}
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
