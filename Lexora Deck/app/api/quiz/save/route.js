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

    const { score, totalQuestions } = await request.json()

    if (score === undefined || score === null || !totalQuestions) {
      return NextResponse.json(
        { error: "score and totalQuestions are required" },
        { status: 400, headers: corsHeaders() },
      )
    }

    const percentage = totalQuestions > 0 ? parseFloat(((score / totalQuestions) * 100).toFixed(2)) : 0

    await query(
      `INSERT INTO quiz_results (user_id, score, total_questions, percentage) VALUES (?, ?, ?, ?)`,
      [decoded.userId, score, totalQuestions, percentage],
    )

    const pointsEarned = score * 5

    return NextResponse.json({ success: true, pointsEarned }, { headers: corsHeaders() })
  } catch (error) {
    console.error("Quiz save error:", error)
    return NextResponse.json({ error: "Failed to save quiz results" }, { status: 500, headers: corsHeaders() })
  }
}
