import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { query } from "../../../../lib/db"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401, headers: corsHeaders() })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const { cardName, category } = await request.json()

    if (!cardName || !category) {
      return NextResponse.json(
        { error: "Card name and category are required" },
        { status: 400, headers: corsHeaders() },
      )
    }

    // Update or insert user progress
    await query(
      `
      INSERT INTO user_progress (user_id, card_name, category, times_viewed, last_viewed)
      VALUES (?, ?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE
        times_viewed = times_viewed + 1,
        last_viewed = NOW()
    `,
      [decoded.userId, cardName, category],
    )

    return NextResponse.json({ success: true }, { headers: corsHeaders() })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500, headers: corsHeaders() })
  }
}
