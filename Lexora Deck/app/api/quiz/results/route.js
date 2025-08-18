import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"
import jwt from "jsonwebtoken"

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
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401, headers: corsHeaders() }
      )
    }

    const token = authHeader.split(" ")[1]
    let userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      userId = decoded.userId
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      )
    }

    const body = await request.json()
    const { score, totalQuestions, timeTaken, answers } = body

    // Validate input
    if (typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return NextResponse.json(
        { error: "Invalid quiz results data" },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Calculate points (10 points per correct answer + bonus for speed)
    const basePoints = score * 10
    const speedBonus = Math.max(0, Math.floor((300 - (timeTaken || 300)) / 10)) // Bonus for completing faster
    const totalPoints = basePoints + speedBonus

    // Store quiz result in database
    await query(`
      INSERT INTO quiz_results (user_id, score, total_questions, time_taken, points_earned, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [userId, score, totalQuestions, timeTaken || 0, totalPoints])

    // Update user progress/stats if needed
    await query(`
      INSERT INTO user_progress (user_id, card_name, times_viewed, last_viewed)
      VALUES (?, 'quiz_completion', 1, NOW())
      ON DUPLICATE KEY UPDATE 
        times_viewed = times_viewed + 1,
        last_viewed = NOW()
    `, [userId])

    return NextResponse.json(
      {
        success: true,
        pointsEarned: totalPoints,
        message: "Quiz results saved successfully"
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error("Quiz results error:", error)
    return NextResponse.json(
      { error: "Failed to save quiz results" },
      { status: 500, headers: corsHeaders() }
    )
  }
}