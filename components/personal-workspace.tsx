"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Trash2, RotateCcw, Trophy, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Habit {
  id: string
  title: string
  goal: number
  unit: string
  progress: number
  emoji: string
  colorIdx: number
  createdAt: string
}

const HABIT_COLORS = [
  { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
]

const PRESETS = [
  { title: "Drink water", unit: "litres", goal: 4, emoji: "💧", colorIdx: 0 },
  { title: "Exercise", unit: "minutes", goal: 30, emoji: "💪", colorIdx: 1 },
  { title: "Read", unit: "pages", goal: 20, emoji: "📖", colorIdx: 2 },
  { title: "Sleep", unit: "hours", goal: 8, emoji: "😴", colorIdx: 3 },
  { title: "Meditate", unit: "minutes", goal: 10, emoji: "🧘", colorIdx: 4 },
  { title: "Steps", unit: "k steps", goal: 10, emoji: "🚶", colorIdx: 5 },
]

const STORAGE_KEY = "personalHabits"

function loadHabits(): Habit[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHabits(habits: Habit[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

export function PersonalWorkspace() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [unit, setUnit] = useState("")
  const [goal, setGoal] = useState("")
  const [emoji, setEmoji] = useState("💧")
  const [colorIdx, setColorIdx] = useState(0)

  useEffect(() => { setHabits(loadHabits()) }, [])

  const persist = (updated: Habit[]) => { setHabits(updated); saveHabits(updated) }

  const addHabit = (preset?: typeof PRESETS[0]) => {
    const h: Habit = {
      id: crypto.randomUUID(),
      title: preset ? preset.title : title,
      goal: preset ? preset.goal : Number(goal),
      unit: preset ? preset.unit : unit,
      progress: 0,
      emoji: preset ? preset.emoji : emoji,
      colorIdx: preset ? preset.colorIdx : colorIdx,
      createdAt: new Date().toISOString(),
    }
    persist([...habits, h])
    setAddOpen(false)
    setTitle(""); setUnit(""); setGoal("")
    toast.success(`"${h.title}" added!`)
  }

  const increment = (id: string, amount: number) => {
    persist(habits.map((h) => {
      if (h.id !== id) return h
      const next = Math.max(0, Math.min(h.goal, h.progress + amount))
      if (next === h.goal && h.progress < h.goal) toast.success(`🎉 "${h.title}" goal reached!`)
      return { ...h, progress: next }
    }))
  }

  const resetHabit = (id: string) => { persist(habits.map((h) => h.id === id ? { ...h, progress: 0 } : h)); toast.success("Reset") }
  const deleteHabit = (id: string) => { persist(habits.filter((h) => h.id !== id)); toast.success("Removed") }
  const resetAll = () => { persist(habits.map((h) => ({ ...h, progress: 0 }))); toast.success("All habits reset") }

  const doneCount = habits.filter((h) => h.progress >= h.goal).length
  const allDone = habits.length > 0 && doneCount === habits.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Personal Workspace</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Daily habits & personal goals — no focus score impact</p>
        </div>
        <div className="flex gap-2">
          {habits.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="size-3.5 mr-1.5" />Reset day
            </Button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5 mr-1.5" />Add habit
          </Button>
        </div>
      </div>

      {allDone && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <Trophy className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">All habits complete for today! 🎉</p>
        </div>
      )}

      {habits.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{doneCount} / {habits.length}</span>
          habits done today
          <Progress value={(doneCount / habits.length) * 100} className="flex-1 h-2" />
        </div>
      )}

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <Heart className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No habits yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add a habit or pick a preset to get started</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {PRESETS.map((p) => (
              <Button key={p.title} variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => addHabit(p)}>
                <span>{p.emoji}</span>{p.title}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((habit) => {
            const color = HABIT_COLORS[habit.colorIdx % HABIT_COLORS.length]
            const pct = Math.min(100, Math.round((habit.progress / habit.goal) * 100))
            const done = habit.progress >= habit.goal
            const step = habit.unit === "litres" || habit.unit === "hours" ? 0.5 : 1

            return (
              <Card key={habit.id} className={cn("border transition-all", done && "ring-1 ring-emerald-500/30")}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-10 rounded-lg flex items-center justify-center text-xl", color.bg)}>
                        {habit.emoji}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-card-foreground">{habit.title}</p>
                        <p className="text-xs text-muted-foreground">{habit.progress} / {habit.goal} {habit.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => resetHabit(habit.id)}>
                        <RotateCcw className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <Progress value={pct} className="h-2 mb-3" />

                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-medium", done ? "text-emerald-600 dark:text-emerald-400" : color.text)}>
                      {done ? "✓ Done!" : `${pct}%`}
                    </span>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => increment(habit.id, -step)} disabled={habit.progress <= 0}>
                        −{step}
                      </Button>
                      <Button size="sm" className="h-7 px-2.5 text-xs" onClick={() => increment(habit.id, step)} disabled={done}>
                        +{step}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {habits.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick add preset:</p>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.filter((p) => !habits.some((h) => h.title === p.title)).map((p) => (
              <Button key={p.title} variant="outline" size="sm" className="text-xs gap-1.5 h-7" onClick={() => addHabit(p)}>
                <span>{p.emoji}</span>{p.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Personal Habit</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Habit name</Label>
              <Input placeholder="e.g., Drink water" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Goal amount</Label>
                <Input type="number" placeholder="e.g., 4" value={goal} onChange={(e) => setGoal(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Unit</Label>
                <Input placeholder="e.g., litres" value={unit} onChange={(e) => setUnit(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Emoji</Label>
              <div className="flex gap-2 flex-wrap">
                {["💧","💪","📖","😴","🧘","🚶","🍎","☕","🔥","🎯"].map((e) => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className={cn("size-9 rounded-lg text-xl flex items-center justify-center border transition-all",
                      emoji === e ? "border-primary bg-primary/10" : "border-border hover:bg-muted")}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {["bg-blue-500","bg-emerald-500","bg-purple-500","bg-orange-500","bg-rose-500","bg-amber-500"].map((c, i) => (
                  <button key={i} onClick={() => setColorIdx(i)}
                    className={cn("size-7 rounded-full border-2 transition-all", c,
                      colorIdx === i ? "border-foreground scale-110" : "border-transparent")} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!title || !goal || !unit} onClick={() => addHabit()}>Add habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
