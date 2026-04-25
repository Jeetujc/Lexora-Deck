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



// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

// Simple test endpoint first
export async function GET() {
  console.log("GET endpoint called")
  return NextResponse.json(
    {
      message: "API route is working!",
      timestamp: new Date().toISOString(),
      path: "/api/gemini/cards",
    },
    {
      headers: corsHeaders(),
    },
  )
}

export async function POST(request) {
  console.log("POST endpoint called")

  try {
    // Safely parse the request body
    let body = {}
    try {
      body = await request.json()
      console.log("Request body:", body)
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: parseError.message,
          fallback: true,
          points: [
            {
              heading: "Error Processing Request",
              description: "There was an error processing your request. Please try again.",
            },
          ],
        },
        {
          status: 400,
          headers: corsHeaders(),
        },
      )
    }

    const { cardName, category } = body

    if (!cardName) {
      console.error("Card name is missing")
      return NextResponse.json(
        {
          error: "Card name is required",
          fallback: true,
          points: [
            {
              heading: "Missing Information",
              description: "Card name is required to generate content.",
            },
          ],
        },
        {
          status: 400,
          headers: corsHeaders(),
        },
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("Gemini API key is not configured")
      return NextResponse.json(
        {
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.",
          fallback: true,
          points: getSampleData(cardName, category),
        },
        {
          status: 500,
          headers: corsHeaders(),
        },
      )
    }

    console.log("API Key present:", apiKey.substring(0, 5) + "...")
    console.log("Generating content for:", cardName)

    // Initialize Gemini AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Try different model names in order of preference
    const modelNames = ["gemini-3.1-flash-lite-preview", "gemini-2.5-pro", "gemini-3.0-flash"]
    let model = null
    let modelUsed = null
    let modelError = null

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`)
        model = genAI.getGenerativeModel({ model: modelName })
        modelUsed = modelName
        break
      } catch (modelErr) {
        console.log(`Model ${modelName} failed:`, modelErr.message)
        modelError = modelErr
        continue
      }
    }

    if (!model) {
      console.error("No available Gemini model found:", modelError)
      return NextResponse.json(
        {
          error: "No available Gemini model found",
          details: modelError?.message || "Unknown error",
          fallback: true,
          points: getSampleData(cardName, category),
        },
        {
          status: 500,
          headers: corsHeaders(),
        },
      )
    }

    console.log(`Using model: ${modelUsed}`)

    // Create the prompt
 const prompt = `
You are an AI educational content generator.

Generate exactly 20 structured learning topics about "${cardName}".

For each topic:
- Provide a clear and concise "heading"
- Provide a "description" containing 5-7 bullet points
- Focus on engineering, practical applications, and interesting insights

STRICT RULES:
- Output ONLY valid JSON
- Do NOT include any extra text, explanation, or markdown
- Ensure the response is a JSON array
- Each object must have:
  {
    "heading": "string",
    "description": ["point1", "point2", "point3"]
  }

Example format:
[
  {
    "heading": "Historical Background",
    "description": ["Point 1", "Point 2", "Point 3"]
  },
  {
    "heading": "Applications",
    "description": ["Point 1", "Point 2", "Point 3"]
  }
]

Make the content informative, structured, and easy to learn.

Topic: "${cardName}"
Return only the JSON array.
`;

    // Generate content
    console.log("Sending request to Gemini...")

    async function fetchWithRetry(fn, retries = 3) {
  try {
    return await fn()
  } catch (err) {
    const is503 = err.message?.includes("503")

    if (retries > 0 && is503) {
      console.log("Retrying Gemini (503)...", retries)
      await new Promise((res) => setTimeout(res, 2000))
      return fetchWithRetry(fn, retries - 1)
    }

    throw err
  }
}

    try {
      const result = await fetchWithRetry(() =>
  model.generateContent(prompt)
)
      const response = await result.response
      const text = response.text()

      console.log("Gemini response received, length:", text.length)
      console.log("Raw response preview:", text.substring(0, 100) + "...")

      // Try to parse the JSON response
      let points = []
      try {
        // Clean the response text
        let cleanText = text.trim()

        // Remove markdown code blocks if present
        cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

        // Extract JSON from the response
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          points = JSON.parse(jsonMatch[0])
        } else {
          // Try to parse the entire cleaned response
          points = JSON.parse(cleanText)
        }

        // Validate the structure
        if (!Array.isArray(points)) {
          throw new Error("Response is not an array")
        }

        // Ensure each point has the required fields and clean up the data
        points = points
          .filter((point) => point && typeof point === "object" && point.heading && point.description)
          .map((point) => ({
            heading: String(point.heading).trim(),
            description: String(point.description).trim(),
          }))
          .slice(0, 10) // Limit to 10 points max

        console.log("Successfully parsed points:", points.length)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError)
        console.error("Raw response:", text)

        // Create structured points from the raw text response
        points = createPointsFromText(text, cardName)
      }

      return NextResponse.json(
        {
          points,
          cardName,
          category,
          modelUsed,
          success: true,
        },
        {
          headers: corsHeaders(),
        },
      )
    } catch (generationError) {
      console.error("Error generating content:", generationError)
      return NextResponse.json(
        {
          error: `Error generating content: ${generationError.message}`,
          fallback: true,
          points: getSampleData(cardName, category),
          cardName,
          category,
        },
        {
          headers: corsHeaders(),
        },
      )
    }
  } catch (error) {
    console.error("Gemini API error:", error)

    // Create fallback data when API completely fails
    return NextResponse.json(
      {
        points: getSampleData(error.cardName || "this topic", error.category || "general"),
        cardName: error.cardName || "Unknown",
        category: error.category || "general",
        error: error instanceof Error ? error.message : "Failed to generate content",
        fallback: true,
        success: false,
      },
      {
        headers: corsHeaders(),
      },
    )
  }
}

// Helper function to create points from raw text
function createPointsFromText(text, cardName) {
  // Try to extract meaningful content from the text
  const lines = text.split("\n").filter((line) => line.trim().length > 10)
  const points = []

  // Try to find headings and descriptions
  for (let i = 0; i < Math.min(lines.length, 8); i += 2) {
    const heading = lines[i] ? lines[i].trim().replace(/^\d+\.?\s*/, "") : `Point ${Math.floor(i / 2) + 1}`
    const description = lines[i + 1] ? lines[i + 1].trim() : `Information about ${cardName}.`

    points.push({
      heading: heading.length > 50 ? heading.substring(0, 50) + "..." : heading,
      description: description.length > 200 ? description.substring(0, 200) + "..." : description,
    })
  }

  // If still no points, create default ones
  if (points.length === 0) {
    return getSampleData(cardName)
  }

  return points
}

// Helper function to get sample data
function getSampleData(cardName, category = "general") {
  return [
    {
      heading: `About ${cardName}`,
      description: `${cardName} is a ${category} related term. This is sample data shown when the API is unavailable. Normally, this would display detailed information from Gemini AI.`,
    },
    {
      heading: "General Usage",
      description: `${cardName} is commonly used in daily life. This sample content demonstrates how the information would be displayed when the API is working properly.`,
    },
    {
      heading: "Cultural Context",
      description: `In Japanese culture, ${cardName} has specific significance and usage patterns. This would contain real cultural insights when connected to the AI service.`,
    },
  ]
}