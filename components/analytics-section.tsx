"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task, Category } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"

const PIE_COLORS = ["#ef4444","#f97316","#3b82f6","#10b981","#a855f7","#6b7280"]

const RANKS = [
  { min: 0,   max: 29,  label: "Beginner", emoji: "🪨", color: "text-stone-400",  bg: "bg-stone-500/10 border-stone-500/30" },
  { min: 30,  max: 59,  label: "Bronze",   emoji: "🥉", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  { min: 60,  max: 99,  label: "Silver",   emoji: "🥈", color: "text-slate-300",  bg: "bg-slate-400/10 border-slate-400/30" },
  { min: 100, max: 149, label: "Gold",     emoji: "🥇", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { min: 150, max: 249, label: "Platinum", emoji: "💎", color: "text-cyan-300",   bg: "bg-cyan-500/10 border-cyan-400/30" },
  { min: 250, max: 399, label: "Diamond",  emoji: "💠", color: "text-blue-300",   bg: "bg-blue-500/10 border-blue-400/30" },
  { min: 400, max: 599, label: "Master",   emoji: "🔮", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { min: 600, max: Infinity, label: "Legend", emoji: "👑", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
]

function getRank(score: number) {
  return RANKS.find((r) => score >= r.min && score <= r.max) ?? RANKS[0]
}

interface AnalyticsSectionProps {
  tasks: Task[]
}

export function AnalyticsSection({ tasks }: AnalyticsSectionProps) {
  const [focusScore, setFocusScore] = useState(50)

  useEffect(() => {
    const stored = localStorage.getItem("focusScore")
    if (stored !== null) setFocusScore(parseInt(stored))
  }, [])

  const rank = getRank(focusScore)
  const nextRank = RANKS.find((r) => r.min > focusScore)
  const progressToNext = nextRank
    ? ((focusScore - rank.min) / (nextRank.min - rank.min)) * 100
    : 100

  const categories: Category[] = ["Academic","Exams","Coding","Reading","Personal","Completed"]
  const pieData = categories
    .map((cat, idx) => ({ name: cat, value: tasks.filter((t) => t.category === cat).length, color: PIE_COLORS[idx] }))
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
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (productivityScore / 100) * circumference

  return (
    <div className="flex flex-col gap-6">

      {/* Focus Score + Rank Card */}
      <Card className={cn("border", rank.bg)}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span className="text-6xl">{rank.emoji}</span>
              <span className={cn("text-xl font-bold", rank.color)}>{rank.label}</span>
              <span className={cn("text-4xl font-bold tabular-nums", rank.color)}>{focusScore}</span>
              <span className="text-xs text-muted-foreground">Focus Score</span>
            </div>

            <div className="flex-1 w-full">
              <h3 className="text-base font-semibold text-foreground mb-1">Your Rank Progress</h3>
              {nextRank ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className={cn("font-semibold", rank.color)}>{nextRank.min - focusScore} more points</span> to reach {nextRank.emoji} {nextRank.label}
                  </p>
                  <div className="h-3 rounded-full bg-muted overflow-hidden mb-4">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", rank.color.replace("text-", "bg-"))}
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-yellow-400 font-medium mb-4">Maximum rank achieved! 👑</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-center">
                  <p className="text-xs text-muted-foreground">High Priority</p>
                  <p className="text-sm font-bold text-red-400">+5 pts/5min</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-center">
                  <p className="text-xs text-muted-foreground">Medium</p>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
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
                  <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
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
                <circle cx="90" cy="90" r={radius} strokeWidth="12" fill="none" strokeLinecap="round" className="stroke-primary transition-all duration-700"
                  style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
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
