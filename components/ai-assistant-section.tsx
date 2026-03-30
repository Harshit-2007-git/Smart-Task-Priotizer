"use client"

import { useState } from "react"
import { useTasks } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Bot, Send, Sparkles, Loader2, User, Lightbulb, ListOrdered, RefreshCw } from "lucide-react"
import { priorityColors, categoryColors } from "@/lib/types"
import type { Task } from "@/lib/types"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  { label: "What should I do first?", icon: ListOrdered },
  { label: "Suggest a study plan", icon: Lightbulb },
  { label: "Which tasks are most urgent?", icon: Sparkles },
  { label: "Help me prioritize my week", icon: RefreshCw },
]

function buildTaskSummary(tasks: Task[]): string {
  const active = tasks.filter((t) => !t.completed)
  if (active.length === 0) return "The student has no active tasks."
  return active
    .map((t) => {
      const deadline = t.deadline ? `deadline: ${t.deadline}` : "no deadline"
      return `- "${t.title}" (${t.priority} priority, ${t.category}, ${deadline})`
    })
    .join("\n")
}

export function AIAssistantSection() {
  const { tasks } = useTasks()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI study assistant 🎓 I can see all your tasks and help you figure out what to work on first, create study plans, or answer any productivity questions. What would you like help with?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const taskSummary = buildTaskSummary(tasks)
    const userMessage: Message = { role: "user", content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const systemPrompt = `You are a smart academic task prioritization assistant for a student productivity app. 
You have access to the student's current tasks:

${taskSummary}

Your job is to:
1. Help the student decide what task to work on first based on priority, deadline, and category
2. Create study plans and schedules
3. Give motivational and practical productivity advice
4. Be concise, friendly, and actionable

Always reference the actual task names when giving advice. Format your responses with clear structure when listing things.`

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      })

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't get a response. Please check your Groq API key."

      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to AI. Make sure your NEXT_PUBLIC_GROQ_API_KEY is set in your .env.local file. Get a free key at console.groq.com" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const activeTasks = tasks.filter((t) => !t.completed)
  const highPriorityTasks = activeTasks.filter((t) => t.priority === "High")
  const overdueTasks = activeTasks.filter((t) => {
    if (!t.deadline) return false
    return new Date(t.deadline) < new Date()
  })

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[80vh]">

      {/* Left Panel: Task Overview + Quick Actions */}
      <div className="lg:w-72 flex flex-col gap-4 shrink-0">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{activeTasks.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Tasks</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{highPriorityTasks.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">High Priority</p>
            </CardContent>
          </Card>
          <Card className={cn("col-span-2", overdueTasks.length > 0 ? "bg-orange-500/5 border-orange-500/20" : "bg-emerald-500/5 border-emerald-500/20")}>
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", overdueTasks.length > 0 ? "text-orange-400" : "text-emerald-400")}>
                {overdueTasks.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Overdue Tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Prompts */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Questions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 flex flex-col gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.label)}
                disabled={isLoading}
                className="flex items-center gap-2 text-left text-sm text-foreground/80 hover:text-foreground hover:bg-blue-500/10 rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-blue-500/20 disabled:opacity-50"
              >
                <p.icon className="size-3.5 text-blue-400 shrink-0" />
                {p.label}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Active Tasks List */}
        {activeTasks.length > 0 && (
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Tasks</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ScrollArea className="h-40">
                <div className="flex flex-col gap-1.5">
                  {activeTasks.slice(0, 10).map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                      <span className="text-xs text-foreground truncate">{task.title}</span>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", priorityColors[task.priority])}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel: Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <CardHeader className="pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">AI Study Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">Powered by Groq (Llama 3) · Free</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Online</span>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    msg.role === "user"
                      ? "bg-blue-600"
                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="size-4 text-white" />
                  ) : (
                    <Bot className="size-4 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  )}
                >
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-in fade-in duration-200">
                <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="size-4 text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask me anything about your tasks..."
              disabled={isLoading}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="size-10 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            Needs NEXT_PUBLIC_GROQ_API_KEY in .env.local · Free at console.groq.com
          </p>
        </div>
      </Card>
    </div>
  )
}
