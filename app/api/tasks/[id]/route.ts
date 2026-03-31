import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()
  const body = await request.json()

  const allowedFields = ["completed", "title", "description", "category", "priority", "deadline"]
  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", params.id)
    .select()

  if (error) {
    console.error("Supabase PATCH error:", error)
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ task: data[0] }, { status: 200 })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 })
}
