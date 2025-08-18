import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "../../../../lib/db"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400, headers: corsHeaders() })
    }

    // Find user
    const users = await query("SELECT id, name, email, password FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders() })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401, headers: corsHeaders() })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { headers: corsHeaders() },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders() })
  }
}
