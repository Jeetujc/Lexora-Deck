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

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401, headers: corsHeaders() })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get fresh user data
    const users = await query("SELECT id, name, email FROM users WHERE id = ?", [decoded.userId])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders() })
    }

    const user = users[0]

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: corsHeaders() })
  }
}
