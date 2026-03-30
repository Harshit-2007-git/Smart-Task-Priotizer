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

  const { completed } = await request.json()

  const { data, error } = await supabase
    .from("tasks")
    .update({ completed }) // ✅ ONLY THIS
    .eq("id", params.id)
    .select()

  if (error) {
    console.error(error)
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
