"use client"

import { useState, useEffect, useRef } from "react"
import { useTasks } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Play, Pause, Square, Timer, CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/types"

const TIMER_OPTIONS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "50 min", seconds: 50 * 60 },
  { label: "90 min", seconds: 90 * 60 },
]

const PRIORITY_POINTS: Record<string, number> = {
  High: 5,
  Medium: 3,
  Low: 1,
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "text-red-400",
  Medium: "text-amber-400",
  Low: "text-emerald-400",
}

// ✅ Rank system
const RANKS = [
  { min: 0,   max: 29,  label: "Beginner",  emoji: "🪨", color: "text-stone-400",  bg: "bg-stone-500/10 border-stone-500/30",   glow: "" },
  { min: 30,  max: 59,  label: "Bronze",    emoji: "🥉", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30",  glow: "shadow-orange-500/20" },
  { min: 60,  max: 99,  label: "Silver",    emoji: "🥈", color: "text-slate-300",  bg: "bg-slate-400/10 border-slate-400/30",   glow: "shadow-slate-400/20" },
  { min: 100, max: 149, label: "Gold",      emoji: "🥇", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", glow: "shadow-yellow-500/20" },
  { min: 150, max: 249, label: "Platinum",  emoji: "💎", color: "text-cyan-300",   bg: "bg-cyan-500/10 border-cyan-400/30",     glow: "shadow-cyan-400/20" },
  { min: 250, max: 399, label: "Diamond",   emoji: "💠", color: "text-blue-300",   bg: "bg-blue-500/10 border-blue-400/30",     glow: "shadow-blue-400/20" },
  { min: 400, max: 599, label: "Master",    emoji: "🔮", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", glow: "shadow-purple-500/20" },
  { min: 600, max: Infinity, label: "Legend", emoji: "👑", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30",     glow: "shadow-pink-500/20" },
]

function getRank(score: number) {
  return RANKS.find((r) => score >= r.min && score <= r.max) ?? RANKS[0]
}

function getNextRank(score: number) {
  const idx = RANKS.findIndex((r) => score >= r.min && score <= r.max)
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
}

const CONFETTI_COLORS = ["#2563eb", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ef4444"]

export function FocusModeSection() {
  const { tasks, toggleComplete } = useTasks()
  const activeTasks = tasks.filter((t) => !t.completed)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [timerOption, setTimerOption] = useState(TIMER_OPTIONS[0])
  const [timeLeft, setTimeLeft] = useState(TIMER_OPTIONS[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  // ✅ Start at 50
  const [focusScore, setFocusScore] = useState(50)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [minutesFocused, setMinutesFocused] = useState(0)
  const [confettiPieces, setConfettiPieces] = useState<{ x: number; y: number; color: string; delay: number }[]>([])
  const [scoreFlash, setScoreFlash] = useState<"up" | "down" | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const secondsElapsedRef = useRef(0)

  // Load focus score — default 50 if never set
  useEffect(() => {
    const stored = localStorage.getItem("focusScore")
    if (stored !== null) {
      setFocusScore(parseInt(stored))
    } else {
      localStorage.setItem("focusScore", "50")
      setFocusScore(50)
    }
  }, [])

  const updateScore = (delta: number) => {
    setFocusScore((prev) => {
      const next = Math.max(0, prev + delta)
      localStorage.setItem("focusScore", String(next))
      setScoreFlash(delta > 0 ? "up" : "down")
      setTimeout(() => setScoreFlash(null), 800)
      return next
    })
  }

  // Countdown
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            handleSessionEnd()
            return 0
          }
          secondsElapsedRef.current += 1
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, isPaused])

  // Score ticker every 5 min
  useEffect(() => {
    if (isRunning && !isPaused && selectedTask) {
      scoreIntervalRef.current = setInterval(() => {
        const pts = PRIORITY_POINTS[selectedTask.priority] ?? 1
        updateScore(pts)
      }, 5 * 60 * 1000)
    } else {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current)
    }
    return () => { if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current) }
  }, [isRunning, isPaused, selectedTask])

  const handleSessionEnd = () => {
    setIsRunning(false)
    setIsPaused(false)
    const mins = Math.floor(secondsElapsedRef.current / 60)
    setMinutesFocused(mins)
    setSessionComplete(true)
    setConfettiPieces(
      Array.from({ length: 60 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 1.5,
      }))
    )
    if (selectedTask) toggleComplete(selectedTask.id)
    setTimeout(() => setConfettiPieces([]), 4000)
  }

  const handleStart = () => {
    if (!selectedTask) return
    setIsRunning(true)
    setIsPaused(false)
    setSessionComplete(false)
    secondsElapsedRef.current = 0
  }

  const handlePause = () => {
    setIsPaused(true)
    updateScore(-2)
  }

  const handleResume = () => setIsPaused(false)

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(timerOption.seconds)
    secondsElapsedRef.current = 0
    setSessionComplete(false)
  }

  const selectTimer = (opt: typeof TIMER_OPTIONS[0]) => {
    if (isRunning) return
    setTimerOption(opt)
    setTimeLeft(opt.seconds)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0")
    const sec = (s % 60).toString().padStart(2, "0")
    return `${m}:${sec}`
  }

  const progress = 1 - timeLeft / timerOption.seconds
  const radius = 110
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const rank = getRank(focusScore)
  const nextRank = getNextRank(focusScore)
  const progressToNext = nextRank
    ? ((focusScore - rank.min) / (nextRank.min - rank.min)) * 100
    : 100

  return (
    <div className="relative flex flex-col gap-6 py-4">

      {/* Confetti */}
      {confettiPieces.map((p, i) => (
        <div
          key={i}
          className="pointer-events-none fixed w-2.5 h-2.5 rounded-sm animate-bounce z-50"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: "1s",
          }}
        />
      ))}

      {/* ✅ RANK BANNER — top of page */}
      <div className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-lg",
        rank.bg, rank.glow && `shadow-lg ${rank.glow}`
      )}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{rank.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Current Rank</p>
            <p className={cn("text-2xl font-bold", rank.color)}>{rank.label}</p>
            {nextRank && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {nextRank.min - focusScore} pts to {nextRank.emoji} {nextRank.label}
              </p>
            )}
            {!nextRank && (
              <p className="text-xs text-yellow-400 mt-0.5 font-medium">Maximum rank achieved! 👑</p>
            )}
          </div>
        </div>

        {/* Score + progress */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Focus Score</span>
            <span className={cn(
              "text-3xl font-bold tabular-nums transition-all duration-300",
              rank.color,
              scoreFlash === "up" && "scale-125 text-emerald-400",
              scoreFlash === "down" && "scale-125 text-red-400",
            )}>
              {focusScore}
            </span>
          </div>
          {nextRank && (
            <div className="w-40">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{rank.label}</span>
                <span>{nextRank.label}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", rank.color.replace("text-", "bg-"))}
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Ranks Reference */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {RANKS.map((r) => (
          <div
            key={r.label}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all",
              focusScore >= r.min
                ? cn(r.bg, "opacity-100")
                : "opacity-30 border-border bg-muted/20"
            )}
          >
            <span className="text-xl">{r.emoji}</span>
            <span className={cn("text-[10px] font-semibold", focusScore >= r.min ? r.color : "text-muted-foreground")}>
              {r.label}
            </span>
            <span className="text-[9px] text-muted-foreground">{r.min}+</span>
          </div>
        ))}
      </div>

      {/* Session complete card */}
      {sessionComplete && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-1">Session Complete! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              You focused for <span className="font-semibold text-foreground">{minutesFocused} minutes</span>
              {selectedTask && <> on <span className="font-semibold text-blue-400">{selectedTask.title}</span></>}
            </p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Task marked as complete ✓</p>
            <Button className="mt-4 w-full" onClick={() => {
              setSessionComplete(false)
              setSelectedTask(null)
              setTimeLeft(timerOption.seconds)
            }}>
              Start Another Session
            </Button>
          </CardContent>
        </Card>
      )}

      {!sessionComplete && (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: Task selector */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Select Task to Focus On</h3>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {activeTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No active tasks!</p>
              ) : (
                activeTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => !isRunning && setSelectedTask(task)}
                    disabled={isRunning}
                    className={cn(
                      "text-left p-3 rounded-lg border transition-all duration-200",
                      selectedTask?.id === task.id
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                        : "border-border bg-card hover:border-blue-500/40 hover:bg-blue-500/5",
                      isRunning && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{task.title}</span>
                      <span className={cn("text-xs font-semibold shrink-0", PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1.5">{task.category}</Badge>
                  </button>
                ))
              )}
            </div>

            {/* Scoring rules */}
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Focus Score Rules</p>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">🔴 High priority → <span className="text-foreground font-medium">+5 pts</span> every 5 min</p>
                <p className="text-xs text-muted-foreground">🟡 Medium priority → <span className="text-foreground font-medium">+3 pts</span> every 5 min</p>
                <p className="text-xs text-muted-foreground">🟢 Low priority → <span className="text-foreground font-medium">+1 pt</span> every 5 min</p>
                <p className="text-xs text-muted-foreground">⏸ Pausing → <span className="text-red-400 font-medium">-2 pts</span></p>
                <p className="text-xs text-muted-foreground">⭐ Everyone starts at <span className="text-yellow-400 font-medium">50 pts (Bronze)</span></p>
              </div>
            </div>
          </div>

          {/* Right: Timer */}
          <div className="flex flex-col items-center gap-6">

            {/* Timer options */}
            <div className="flex gap-2">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => selectTimer(opt)}
                  disabled={isRunning}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                    timerOption.label === opt.label
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-border text-muted-foreground hover:border-blue-500/50",
                    isRunning && "cursor-not-allowed opacity-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Circular timer */}
            <div className="relative flex items-center justify-center">
              {isRunning && !isPaused && (
                <div className="absolute w-[260px] h-[260px] rounded-full bg-blue-500/10 animate-pulse" />
              )}
              <svg width="260" height="260" viewBox="0 0 260 260" className="transform -rotate-90">
                <circle cx="130" cy="130" r={radius} strokeWidth="10" fill="none" className="stroke-muted" />
                <circle
                  cx="130" cy="130" r={radius} strokeWidth="10" fill="none" strokeLinecap="round"
                  stroke={isPaused ? "#f59e0b" : "#2563eb"}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset,
                    transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease",
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-bold tabular-nums text-foreground tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {isPaused ? "Paused ⏸" : isRunning ? "Focusing... 🔥" : "Ready"}
                </span>
                {selectedTask && (
                  <span className="text-xs text-blue-400 font-medium mt-1 max-w-[140px] text-center truncate">
                    {selectedTask.title}
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isRunning ? (
                <Button
                  size="lg"
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                  onClick={handleStart}
                  disabled={!selectedTask}
                >
                  <Play className="size-4 mr-2 fill-current" />
                  Start Focus
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button size="lg" className="px-6 bg-blue-600 hover:bg-blue-700" onClick={handleResume}>
                      <Play className="size-4 mr-2 fill-current" />
                      Resume
                    </Button>
                  ) : (
                    <Button size="lg" variant="outline" className="px-6" onClick={handlePause}>
                      <Pause className="size-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button size="lg" variant="destructive" className="px-6" onClick={handleStop}>
                    <Square className="size-4 mr-2 fill-current" />
                    End
                  </Button>
                </>
              )}
            </div>
            {!selectedTask && !isRunning && (
              <p className="text-xs text-muted-foreground animate-pulse">← Select a task to begin</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
