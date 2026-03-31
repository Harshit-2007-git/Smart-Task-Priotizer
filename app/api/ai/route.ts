import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messages, systemPrompt } = await request.json()

    const groqKey = process.env.GROQ_API_KEY

    if (!groqKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not set in Vercel environment variables" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // ✅ updated model — replaces decommissioned llama3-8b-8192
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? "Groq API error" },
        { status: response.status }
      )
    }

    const reply = data.choices?.[0]?.message?.content ?? "No response from AI"
    return NextResponse.json({ reply })

  } catch (err) {
    console.error("AI route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
