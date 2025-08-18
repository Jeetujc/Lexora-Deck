import { NextResponse } from "next/server"

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
    // Sample quiz questions based on flashcard categories
    const quizQuestions = [
      {
        id: 1,
        question: "What does '自転車' mean in English?",
        options: ["Car", "Bicycle", "Train", "Bus"],
        correct: 1,
        explanation: "'自転車' (jitensha) means bicycle in Japanese.",
        category: "Transportation",
        source: "transportation_flashcard"
      },
      {
        id: 2,
        question: "How do you say 'Good morning' in Japanese?",
        options: ["Konnichiwa", "Ohayou gozaimasu", "Konbanwa", "Sayonara"],
        correct: 1,
        explanation: "'おはようございます' (Ohayou gozaimasu) is the polite way to say good morning.",
        category: "Greetings",
        source: "greetings_flashcard"
      },
      {
        id: 3,
        question: "What is the number '三' in English?",
        options: ["Two", "Three", "Four", "Five"],
        correct: 1,
        explanation: "'三' (san) is the number three in Japanese.",
        category: "Numbers",
        source: "numbers_flashcard"
      },
      {
        id: 4,
        question: "Which Hiragana character represents 'ka'?",
        options: ["か", "き", "く", "け"],
        correct: 0,
        explanation: "'か' (ka) is the Hiragana character for the sound 'ka'.",
        category: "Hiragana",
        source: "hiragana_flashcard"
      },
      {
        id: 5,
        question: "What does '学校' mean?",
        options: ["Hospital", "School", "Library", "Restaurant"],
        correct: 1,
        explanation: "'学校' (gakkou) means school in Japanese.",
        category: "Education",
        source: "education_flashcard"
      },
      {
        id: 6,
        question: "How do you say 'Thank you' in Japanese?",
        options: ["Sumimasen", "Arigato gozaimasu", "Gomen nasai", "Irasshaimase"],
        correct: 1,
        explanation: "'ありがとうございます' (Arigato gozaimasu) is the polite way to say thank you.",
        category: "Greetings",
        source: "greetings_flashcard"
      },
      {
        id: 7,
        question: "What color is '赤'?",
        options: ["Blue", "Red", "Green", "Yellow"],
        correct: 1,
        explanation: "'赤' (aka) means red in Japanese.",
        category: "Colors",
        source: "colors_flashcard"
      },
      {
        id: 8,
        question: "What does '食べ物' mean?",
        options: ["Drink", "Food", "Book", "Money"],
        correct: 1,
        explanation: "'食べ物' (tabemono) means food in Japanese.",
        category: "Food",
        source: "food_flashcard"
      }
    ]

    return NextResponse.json(
      {
        questions: quizQuestions,
        totalQuestions: quizQuestions.length,
        categories: [...new Set(quizQuestions.map(q => q.category))],
        success: true
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error("Quiz questions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz questions" },
      { status: 500, headers: corsHeaders() }
    )
  }
}