import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    )
  }

  // Dummy register - always succeeds
  return NextResponse.json(
    {
      user: {
        id: "1",
        email,
        name: "Alex Student",
      },
      token: "dummy-jwt-token-" + Date.now(),
    },
    { status: 201 }
  )
}
