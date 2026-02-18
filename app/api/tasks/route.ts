import { NextResponse } from "next/server"
import { dummyTasks } from "@/lib/dummy-data"

export async function GET() {
  return NextResponse.json({ tasks: dummyTasks }, { status: 200 })
}

export async function POST(request: Request) {
  const body = await request.json()

  const newTask = {
    id: String(Date.now()),
    ...body,
    completed: false,
    createdAt: new Date().toISOString().split("T")[0],
  }

  return NextResponse.json({ task: newTask }, { status: 201 })
}
