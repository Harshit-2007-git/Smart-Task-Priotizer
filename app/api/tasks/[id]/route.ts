import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updatedTask = {
    id,
    ...body,
  }

  return NextResponse.json({ task: updatedTask }, { status: 200 })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json(
    { message: `Task ${id} deleted successfully` },
    { status: 200 }
  )
}
