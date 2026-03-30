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

  // ✅ Smart update logic
  const updateData: any = {
    ...body,
  }

  // 👉 If marking completed → add timestamp
  if (body.completed === true) {
    updateData.completed_at = new Date().toISOString()
  }

  // 👉 If unchecking → remove timestamp
  if (body.completed === false) {
    updateData.completed_at = null
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", params.id)
    .select()

  if (error) {
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
