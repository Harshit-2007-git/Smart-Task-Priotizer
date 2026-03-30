"use client"

import { useState, useEffect, useRef } from "react"
import { useTasks } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Play, Pause, Square, Timer, Trophy, Flame, CheckCircle2 } from "lucide-react"
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

const CONFETTI_COLORS = ["#2563eb", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ef4444"]

export function FocusModeSection() {
  const { tasks, toggleComplete } = useTasks()
  const activeTasks = tasks.filter((t) => !t.completed)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [timerOption, setTimerOption] = useState(TIMER_OPTIONS[0])
  const [timeLeft, setTimeLeft] = useState(TIMER_OPTIONS[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [focusScore, setFocusScore] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [minutesFocused, setMinutesFocused] = useState(0)
  const [confettiPieces, setConfettiPieces] = useState<{ x: number; y: number; color: string; delay: number }[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const secondsElapsedRef = useRef(0)

  // Load focus score from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("focusScore")
    if (stored) setFocusScore(parseInt(stored))
  }, [])

  // Main countdown
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

  // Score ticker — +points every 5 min of focus
  useEffect(() => {
    if (isRunning && !isPaused && selectedTask) {
      scoreIntervalRef.current = setInterval(() => {
        const pts = PRIORITY_POINTS[selectedTask.priority] ?? 1
        setFocusScore((prev) => {
          const next = prev + pts
          localStorage.setItem("focusScore", String(next))
          return next
        })
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
    // Generate confetti
    setConfettiPieces(
      Array.from({ length: 60 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 1.5,
      }))
    )
    // Mark task complete
    if (selectedTask) {
      toggleComplete(selectedTask.id)
    }
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
    // Deduct 2 pts for pausing
    setFocusScore((prev) => {
      const next = Math.max(0, prev - 2)
      localStorage.setItem("focusScore", String(next))
      return next
    })
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

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-start gap-8 py-8 overflow-hidden">

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

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

      {/* Header */}
      <div className="text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="size-5 text-blue-400" />
          <h2 className="text-2xl font-bold text-foreground">Focus Mode</h2>
        </div>
        <p className="text-sm text-muted-foreground">Select a task, set your timer, and get into the zone.</p>
      </div>

      {/* Focus Score Banner */}
      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 z-10">
        <Flame className="size-4 text-orange-400" />
        <span className="text-sm font-medium text-foreground">Focus Score:</span>
        <span className="text-lg font-bold text-blue-400">{focusScore}</span>
        <Trophy className="size-4 text-yellow-400" />
      </div>

      {/* Session Complete Card */}
      {sessionComplete && (
        <Card className="w-full max-w-md border-emerald-500/30 bg-emerald-500/5 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-1">Session Complete! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              You focused for <span className="font-semibold text-foreground">{minutesFocused} minutes</span>
              {selectedTask && (
                <> on <span className="font-semibold text-blue-400">{selectedTask.title}</span></>
              )}
            </p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Task marked as complete ✓</p>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                setSessionComplete(false)
                setSelectedTask(null)
                setTimeLeft(timerOption.seconds)
              }}
            >
              Start Another Session
            </Button>
          </CardContent>
        </Card>
      )}

      {!sessionComplete && (
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl z-10">

          {/* Left: Task Selector */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Select Task to Focus On</h3>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {activeTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No active tasks. Add some tasks first!</p>
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
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{task.category}</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Scoring Info */}
            <div className="rounded-lg border border-border bg-card p-3 mt-2">
              <p className="text-xs font-semibold text-foreground mb-2">How Focus Score Works</p>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">🔴 High priority task → <span className="text-foreground font-medium">+5 pts</span> every 5 min</p>
                <p className="text-xs text-muted-foreground">🟡 Medium priority task → <span className="text-foreground font-medium">+3 pts</span> every 5 min</p>
                <p className="text-xs text-muted-foreground">🟢 Low priority task → <span className="text-foreground font-medium">+1 pt</span> every 5 min</p>
                <p className="text-xs text-muted-foreground">⏸ Pausing session → <span className="text-red-400 font-medium">-2 pts</span></p>
              </div>
            </div>
          </div>

          {/* Right: Timer */}
          <div className="flex flex-col items-center gap-6">

            {/* Timer Option Selector */}
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

            {/* Circular Timer */}
            <div className="relative flex items-center justify-center">
              {/* Outer glow ring when running */}
              {isRunning && !isPaused && (
                <div className="absolute w-[260px] h-[260px] rounded-full bg-blue-500/10 animate-pulse" />
              )}
              <svg width="260" height="260" viewBox="0 0 260 260" className="transform -rotate-90">
                {/* Track */}
                <circle cx="130" cy="130" r={radius} strokeWidth="10" fill="none" className="stroke-muted" />
                {/* Progress */}
                <circle
                  cx="130"
                  cy="130"
                  r={radius}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
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
                  {isPaused ? "Paused" : isRunning ? "Focusing..." : "Ready"}
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
