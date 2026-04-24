import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// ─── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:3000",
]

function corsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  }
}

// ─── RETRY CONFIG ─────────────────────────────────────────────────────────────
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,   // 1 second
  maxDelay: 8000,    // 8 seconds
  timeout: 15000,    // 15 seconds per attempt
}

// ─── IN-MEMORY CACHE (TTL 5 min, max 100 entries) ────────────────────────────
const responseCache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function getCacheKey(cardName, category) {
  return `${cardName.toLowerCase().trim()}:${(category || "general").toLowerCase()}`
}

function getCachedResponse(key) {
  const cached = responseCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    responseCache.delete(key)
    return null
  }
  return cached.data
}

function setCachedResponse(key, data) {
  if (responseCache.size >= 100) {
    // Evict oldest entry
    const oldest = responseCache.keys().next().value
    responseCache.delete(oldest)
  }
  responseCache.set(key, { data, timestamp: Date.now() })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function isRetryableError(error) {
  const msg = (error?.message || "").toLowerCase()
  const status = error?.status || error?.statusCode
  return (
    status === 429 ||
    status === 503 ||
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("503") ||
    msg.includes("service unavailable") ||
    msg.includes("network") ||
    msg.includes("econnreset") ||
    msg.includes("timeout") ||
    msg.includes("abort")
  )
}

// Wraps generateContent with a hard timeout
async function generateWithTimeout(model, prompt, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    model
      .generateContent(prompt)
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

// Retry wrapper with exponential back-off + full jitter
async function generateWithRetry(model, prompt) {
  let lastError = null
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`🔄 Gemini attempt ${attempt}/${RETRY_CONFIG.maxRetries}`)
      const result = await generateWithTimeout(model, prompt, RETRY_CONFIG.timeout)
      console.log(`✅ Gemini succeeded on attempt ${attempt}`)
      return result
    } catch (error) {
      lastError = error
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`)
      if (attempt < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
        const base = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1)
        const jitter = Math.random() * 500
        const delay = Math.min(base + jitter, RETRY_CONFIG.maxDelay)
        console.log(`⏳ Retrying in ${Math.round(delay)}ms...`)
        await sleep(delay)
      } else {
        break
      }
    }
  }
  throw lastError
}

// ─── MODEL CASCADE ────────────────────────────────────────────────────────────
const MODEL_PREFERENCE = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
]

// ─── RESPONSE PARSING ─────────────────────────────────────────────────────────
function parseGeminiText(text, cardName) {
  let cleanText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "")
  const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
  let points = []
  try {
    points = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText)
  } catch {
    return createPointsFromText(text, cardName)
  }
  if (!Array.isArray(points) || points.length === 0) return createPointsFromText(text, cardName)
  return points
    .filter((p) => p && typeof p === "object" && p.heading && p.description)
    .map((p) => ({ heading: String(p.heading).trim(), description: String(p.description).trim() }))
    .slice(0, 10)
}

function createPointsFromText(text, cardName) {
  const lines = text.split("\n").filter((l) => l.trim().length > 10)
  const points = []
  for (let i = 0; i < Math.min(lines.length, 8); i += 2) {
    const heading = lines[i]?.trim().replace(/^\d+\.?\s*/, "") || `Point ${Math.floor(i / 2) + 1}`
    const description = lines[i + 1]?.trim() || `Information about ${cardName}.`
    points.push({
      heading: heading.length > 60 ? heading.substring(0, 60) + "…" : heading,
      description: description.length > 250 ? description.substring(0, 250) + "…" : description,
    })
  }
  return points.length > 0 ? points : getSampleData(cardName)
}

function getSampleData(cardName, category = "general") {
  return [
    {
      heading: `About ${cardName}`,
      description: `${cardName} is a ${category} related topic. This is placeholder data shown when the AI service is temporarily unavailable.`,
    },
    {
      heading: "General Usage",
      description: `${cardName} is commonly explored in everyday learning. When the API is connected, you'll see rich AI-generated content here.`,
    },
    {
      heading: "Tip",
      description: `Ensure your GEMINI_API_KEY is set in the environment variables to enable AI-powered content generation.`,
    },
  ]
}

// ─── ROUTE HANDLERS ───────────────────────────────────────────────────────────
export async function OPTIONS(request) {
  const origin = request.headers.get("origin") || ""
  return new Response(null, { status: 200, headers: corsHeaders(origin) })
}

export async function GET(request) {
  const origin = request.headers.get("origin") || ""
  return NextResponse.json(
    { message: "Gemini cards API is working!", timestamp: new Date().toISOString() },
    { headers: corsHeaders(origin) },
  )
}

export async function POST(request) {
  const origin = request.headers.get("origin") || ""
  const headers = corsHeaders(origin)

  // ── Parse body ──
  let body = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request format", fallback: true, points: getSampleData("this topic") },
      { status: 400, headers },
    )
  }

  const { cardName, category } = body
  if (!cardName) {
    return NextResponse.json(
      { error: "cardName is required", fallback: true, points: getSampleData("this topic") },
      { status: 400, headers },
    )
  }

  // ── Cache lookup ──
  const cacheKey = getCacheKey(cardName, category)
  const cached = getCachedResponse(cacheKey)
  if (cached) {
    console.log(`📦 Cache hit for "${cardName}"`)
    return NextResponse.json({ ...cached, fromCache: true }, { headers })
  }

  // ── API key check ──
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured")
    return NextResponse.json(
      {
        error: "Gemini API key not configured. Add GEMINI_API_KEY to your environment variables.",
        fallback: true,
        points: getSampleData(cardName, category),
      },
      { status: 503, headers },
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  const prompt = `Give me 8-10 key facts about "${cardName}" in the context of ${category || "general knowledge"}.
Each fact should have a concise heading (5 words max) and a 2-3 sentence description.
Return ONLY a JSON array — no markdown, no code fences, no extra text.

Format:
[
  { "heading": "Short Title Here", "description": "Two to three informative sentences about this aspect." }
]`

  // ── Try models in order ──
  let lastError = null
  for (const modelName of MODEL_PREFERENCE) {
    try {
      console.log(`🤖 Trying model: ${modelName}`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await generateWithRetry(model, prompt)
      const text = result.response.text()
      console.log(`📄 Response length: ${text.length}`)

      const points = parseGeminiText(text, cardName)
      if (points.length === 0) throw new Error("Parsed zero points from response")

      const payload = { points, cardName, category, modelUsed: modelName, success: true }
      setCachedResponse(cacheKey, payload)
      return NextResponse.json(payload, { headers })
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message)
      lastError = err
      // If it's a quota/auth error, no point trying other models with the same key
      const msg = err.message?.toLowerCase() || ""
      if (msg.includes("api_key") || msg.includes("permission") || msg.includes("unauthorized")) break
    }
  }

  // ── All models failed – return fallback data (still 200 so UI can render) ──
  console.error("All Gemini models failed. Returning fallback data.")
  return NextResponse.json(
    {
      points: getSampleData(cardName, category),
      cardName,
      category,
      error: `AI service unavailable: ${lastError?.message || "unknown error"}`,
      fallback: true,
      success: false,
    },
    { headers },
  )
}

