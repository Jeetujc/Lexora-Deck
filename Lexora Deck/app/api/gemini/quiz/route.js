import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const MODEL_PREFERENCE = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
]

function getFallbackQuestions(topic) {
  return [
    {
      question: `Which of the following best describes "${topic}"?`,
      options: [
        `A foundational concept in ${topic}`,
        `An advanced technique in ${topic}`,
        `A historical origin of ${topic}`,
        `A common misconception about ${topic}`,
      ],
      correct: 0,
      explanation: `This is a placeholder question. Connect your Gemini API key to generate real questions about ${topic}.`,
      category: topic,
    },
    {
      question: `What is commonly associated with ${topic}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 1,
      explanation: `Add your GEMINI_API_KEY environment variable to generate real quiz questions about ${topic}.`,
      category: topic,
    },
  ]
}

function parseQuizResponse(text, topic) {
  let clean = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "")
  const match = clean.match(/\[[\s\S]*\]/)
  let questions = []
  try {
    questions = JSON.parse(match ? match[0] : clean)
  } catch {
    return getFallbackQuestions(topic)
  }
  if (!Array.isArray(questions) || questions.length === 0) return getFallbackQuestions(topic)

  return questions
    .filter(
      (q) =>
        q &&
        typeof q === "object" &&
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correct === "number",
    )
    .map((q) => ({
      question: String(q.question).trim(),
      options: q.options.map((o) => String(o).trim()),
      correct: Number(q.correct),
      explanation: String(q.explanation || "").trim(),
      category: String(q.category || topic).trim(),
    }))
    .slice(0, 10)
}

export async function OPTIONS(request) {
  const origin = request.headers.get("origin") || ""
  return new Response(null, { status: 200, headers: corsHeaders(origin) })
}

export async function POST(request) {
  const origin = request.headers.get("origin") || ""
  const headers = corsHeaders(origin)

  let body = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request", fallback: true, questions: [] }, { status: 400, headers })
  }

  const { topic, count = 5, difficulty = "medium" } = body
  if (!topic) {
    return NextResponse.json({ error: "topic is required", fallback: true, questions: [] }, { status: 400, headers })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { fallback: true, questions: getFallbackQuestions(topic), topic },
      { headers },
    )
  }

  const difficultyDesc =
    difficulty === "easy"
      ? "straightforward, suitable for beginners"
      : difficulty === "hard"
        ? "challenging and nuanced, suitable for experts"
        : "moderately challenging, suitable for intermediate learners"

  const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${topic}".
Difficulty: ${difficultyDesc}.
Each question must have exactly 4 options and one correct answer.
Return ONLY a JSON array — no markdown, no code fences, no extra text.

Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct.",
    "category": "Sub-topic label"
  }
]

The "correct" field is a 0-based index into the options array.`

  const genAI = new GoogleGenerativeAI(apiKey)
  let lastError = null

  for (const modelName of MODEL_PREFERENCE) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 15000)
      const result = await model.generateContent(prompt)
      clearTimeout(timer)
      const text = result.response.text()
      const questions = parseQuizResponse(text, topic)
      if (questions.length === 0) throw new Error("Parsed zero questions")
      return NextResponse.json({ questions, topic, modelUsed: modelName, success: true }, { headers })
    } catch (err) {
      lastError = err
      console.error(`Quiz model ${modelName} failed:`, err.message)
      const msg = (err.message || "").toLowerCase()
      if (msg.includes("api_key") || msg.includes("permission") || msg.includes("unauthorized")) break
      if (MODEL_PREFERENCE.indexOf(modelName) < MODEL_PREFERENCE.length - 1) await sleep(500)
    }
  }

  return NextResponse.json(
    { questions: getFallbackQuestions(topic), topic, fallback: true, error: lastError?.message },
    { headers },
  )
}
