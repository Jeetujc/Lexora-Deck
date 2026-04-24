import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

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

export async function GET() {
  try {
    // Get leaderboard data with user stats (flashcard views + quiz scores)
    const leaderboardData = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(SUM(up.times_viewed), 0) as total_cards_viewed,
        COALESCE(COUNT(DISTINCT up.card_name), 0) as unique_cards_studied,
        COALESCE(SUM(qr.score), 0) as total_quiz_score,
        COALESCE(COUNT(qr.id), 0) as quizzes_taken,
        COALESCE(SUM(up.times_viewed), 0) * 10
          + COALESCE(COUNT(DISTINCT up.card_name), 0) * 25
          + COALESCE(SUM(qr.score), 0) * 5 as total_points,
        COALESCE(MAX(up.last_viewed), u.created_at) as last_activity,
        u.created_at
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN quiz_results qr ON u.id = qr.user_id
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY total_points DESC, unique_cards_studied DESC, total_cards_viewed DESC
      LIMIT 50
    `)

    // Add rank to each user; coerce BigInt/string DB values to Number to avoid NaN
    const rankedData = leaderboardData.map((user, index) => {
      const totalPoints = Number(user.total_points)
      return {
        ...user,
        total_cards_viewed: Number(user.total_cards_viewed),
        unique_cards_studied: Number(user.unique_cards_studied),
        total_quiz_score: Number(user.total_quiz_score ?? 0),
        quizzes_taken: Number(user.quizzes_taken ?? 0),
        total_points: totalPoints,
        rank: index + 1,
        badge: getBadge(index + 1),
        level: getLevel(totalPoints),
      }
    })

    return NextResponse.json(
      {
        leaderboard: rankedData,
        totalUsers: rankedData.length,
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500, headers: corsHeaders() })
  }
}

function getBadge(rank) {
  if (rank === 1) return { emoji: "🥇", name: "Gold", color: "text-yellow-500" }
  if (rank === 2) return { emoji: "🥈", name: "Silver", color: "text-gray-400" }
  if (rank === 3) return { emoji: "🥉", name: "Bronze", color: "text-orange-600" }
  if (rank <= 10) return { emoji: "🏆", name: "Top 10", color: "text-purple-500" }
  if (rank <= 25) return { emoji: "⭐", name: "Rising Star", color: "text-blue-500" }
  return { emoji: "🎯", name: "Learner", color: "text-green-500" }
}

function getLevel(points) {
  if (points >= 1000) return { level: "Master", color: "text-purple-600", icon: "👑" }
  if (points >= 500) return { level: "Expert", color: "text-red-500", icon: "🔥" }
  if (points >= 250) return { level: "Advanced", color: "text-orange-500", icon: "⚡" }
  if (points >= 100) return { level: "Intermediate", color: "text-blue-500", icon: "📚" }
  if (points >= 25) return { level: "Beginner", color: "text-green-500", icon: "🌱" }
  return { level: "Newcomer", color: "text-gray-500", icon: "👋" }
}
