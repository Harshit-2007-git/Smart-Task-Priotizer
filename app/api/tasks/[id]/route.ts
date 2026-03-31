import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()

  // ✅ Accept any fields sent — not just completed
  // This fixes updateTask (edit) AND toggleComplete both working correctly
  const { data, error } = await supabase
    .from("tasks")
    .update(body)
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json(
    { message: "Task deleted successfully" },
    { status: 200 }
  )
}
