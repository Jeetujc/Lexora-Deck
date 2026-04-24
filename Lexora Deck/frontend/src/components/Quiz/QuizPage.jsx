"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

const quizTopics = [
  {
    id: "japanese",
    title: "Japanese",
    subtitle: "Language",
    icon: "🇯🇵",
    color: "bg-red-100",
    description: "Vocabulary, Hiragana & Numbers",
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Money & Markets",
    icon: "₹",
    color: "bg-blue-100",
    description: "Economics, Investing & More",
  },
  {
    id: "coding",
    title: "Coding",
    subtitle: "Tech Quiz",
    icon: "👨🏻‍💻",
    color: "bg-yellow-100",
    description: "Programming Concepts",
  },
  {
    id: "health",
    title: "Health",
    subtitle: "Body & Mind",
    icon: "🩺",
    color: "bg-green-100",
    description: "Fitness, Nutrition & Wellness",
  },
  {
    id: "general",
    title: "General",
    subtitle: "Mixed Topics",
    icon: "✨",
    color: "bg-purple-100",
    description: "Trivia & General Knowledge",
  },
  {
    id: "books",
    title: "Literature",
    subtitle: "Books & Classics",
    icon: "📚",
    color: "bg-indigo-100",
    description: "Authors, Plots & More",
  },
]

const allQuizQuestions = {
  japanese: [
    {
      id: 1,
      question: "What does '自転車' mean in English?",
      options: ["Car", "Bicycle", "Train", "Bus"],
      correct: 1,
      explanation: "'自転車' (jitensha) means bicycle in Japanese.",
      category: "Transportation",
    },
    {
      id: 2,
      question: "How do you say 'Thank you' in Japanese?",
      options: ["Konnichiwa", "Sayonara", "Arigato", "Sumimasen"],
      correct: 2,
      explanation: "'ありがとう' (Arigato) means 'Thank you' in Japanese.",
      category: "Greetings",
    },
    {
      id: 3,
      question: "What does '本' mean?",
      options: ["Book", "House", "Food", "Money"],
      correct: 0,
      explanation: "'本' (hon) means book in Japanese.",
      category: "Education",
    },
    {
      id: 4,
      question: "Which hiragana represents the sound 'ka'?",
      options: ["か", "き", "く", "け"],
      correct: 0,
      explanation: "'か' represents the sound 'ka' in hiragana.",
      category: "Hiragana",
    },
    {
      id: 5,
      question: "What does '食べ物' mean?",
      options: ["Drink", "Food", "Restaurant", "Kitchen"],
      correct: 1,
      explanation: "'食べ物' (tabemono) means food in Japanese.",
      category: "Food",
    },
    {
      id: 6,
      question: "How do you say 'Good morning' in Japanese?",
      options: ["Konbanwa", "Ohayo gozaimasu", "Konnichiwa", "Oyasumi"],
      correct: 1,
      explanation: "'おはようございます' (Ohayo gozaimasu) means 'Good morning'.",
      category: "Greetings",
    },
    {
      id: 7,
      question: "What does '家' mean?",
      options: ["School", "House", "Shop", "Park"],
      correct: 1,
      explanation: "'家' (ie/uchi) means house or home in Japanese.",
      category: "Places",
    },
    {
      id: 8,
      question: "Which number is '三'?",
      options: ["Two", "Three", "Four", "Five"],
      correct: 1,
      explanation: "'三' (san) means three in Japanese.",
      category: "Numbers",
    },
  ],
  finance: [
    {
      id: 1,
      question: "What does 'ROI' stand for?",
      options: ["Rate of Income", "Return on Investment", "Risk of Inflation", "Revenue on Interest"],
      correct: 1,
      explanation: "ROI stands for Return on Investment — the gain relative to the cost.",
      category: "Finance",
    },
    {
      id: 2,
      question: "What is a 'bull market'?",
      options: ["Prices are falling", "Market is closed", "Prices are rising", "High inflation period"],
      correct: 2,
      explanation: "A bull market refers to a period of rising asset prices, typically 20%+.",
      category: "Markets",
    },
    {
      id: 3,
      question: "What is the main purpose of a central bank?",
      options: ["Provide personal loans", "Regulate monetary policy", "Sell government bonds directly", "Issue corporate stocks"],
      correct: 1,
      explanation: "Central banks regulate monetary policy, control inflation, and manage currency.",
      category: "Banking",
    },
    {
      id: 4,
      question: "What does 'diversification' mean in investing?",
      options: ["Investing in one asset", "Spreading investments across different assets", "Only buying government bonds", "Selling all stocks"],
      correct: 1,
      explanation: "Diversification means spreading investments to reduce risk.",
      category: "Investing",
    },
    {
      id: 5,
      question: "What is 'compound interest'?",
      options: ["Simple interest on principal", "Interest earned on interest", "A fixed tax rate", "Stock dividend"],
      correct: 1,
      explanation: "Compound interest is interest calculated on both principal and accumulated interest.",
      category: "Banking",
    },
  ],
  coding: [
    {
      id: 1,
      question: "What does 'HTML' stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Method Language", "Home Tool Markup Language"],
      correct: 0,
      explanation: "HTML stands for HyperText Markup Language — the backbone of web pages.",
      category: "Web",
    },
    {
      id: 2,
      question: "Which is NOT a JavaScript data type?",
      options: ["String", "Boolean", "Float", "Undefined"],
      correct: 2,
      explanation: "JavaScript has 'Number' not 'Float' as a distinct type.",
      category: "JavaScript",
    },
    {
      id: 3,
      question: "What does 'API' stand for?",
      options: ["Application Programming Interface", "Automated Program Index", "Application Process Integration", "Advanced Programming Input"],
      correct: 0,
      explanation: "API stands for Application Programming Interface.",
      category: "Concepts",
    },
    {
      id: 4,
      question: "Which sorting algorithm has O(n log n) average time complexity?",
      options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
      correct: 2,
      explanation: "Merge Sort has O(n log n) average and worst-case time complexity.",
      category: "Algorithms",
    },
    {
      id: 5,
      question: "What is a 'null pointer' exception?",
      options: ["Memory overflow", "Accessing an object reference with no value", "Infinite loop", "Type mismatch"],
      correct: 1,
      explanation: "A null pointer exception occurs when you try to use an object reference that points to null.",
      category: "Concepts",
    },
  ],
  health: [
    {
      id: 1,
      question: "How many bones are in the adult human body?",
      options: ["196", "206", "216", "226"],
      correct: 1,
      explanation: "An adult human body has 206 bones.",
      category: "Anatomy",
    },
    {
      id: 2,
      question: "Which vitamin is produced by the skin when exposed to sunlight?",
      options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
      correct: 3,
      explanation: "Vitamin D is synthesized by the skin upon exposure to UVB sunlight.",
      category: "Nutrition",
    },
    {
      id: 3,
      question: "What is the recommended daily water intake for adults?",
      options: ["1 liter", "1.5 liters", "2 liters", "3 liters"],
      correct: 2,
      explanation: "Health guidelines generally recommend about 2 liters (8 cups) per day.",
      category: "Wellness",
    },
    {
      id: 4,
      question: "What is the normal resting heart rate for adults?",
      options: ["40-50 bpm", "60-100 bpm", "110-120 bpm", "130-140 bpm"],
      correct: 1,
      explanation: "Normal resting heart rate for adults is 60-100 beats per minute.",
      category: "Physiology",
    },
    {
      id: 5,
      question: "Which macronutrient provides 4 calories per gram?",
      options: ["Fat", "Carbohydrate", "Alcohol", "Fiber"],
      correct: 1,
      explanation: "Carbohydrates provide 4 calories per gram (protein too; fat provides 9).",
      category: "Nutrition",
    },
  ],
  general: [
    {
      id: 1,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correct: 2,
      explanation: "Mars is called the Red Planet due to iron oxide on its surface.",
      category: "Science",
    },
    {
      id: 2,
      question: "Who painted the Mona Lisa?",
      options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Caravaggio"],
      correct: 2,
      explanation: "The Mona Lisa was painted by Leonardo da Vinci.",
      category: "Art",
    },
    {
      id: 3,
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correct: 3,
      explanation: "The Pacific Ocean is the largest, covering more than 30% of Earth's surface.",
      category: "Geography",
    },
    {
      id: 4,
      question: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correct: 2,
      explanation: "World War II ended in 1945 with Germany surrendering in May and Japan in September.",
      category: "History",
    },
    {
      id: 5,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correct: 2,
      explanation: "Gold's chemical symbol is Au, from the Latin word 'Aurum'.",
      category: "Chemistry",
    },
  ],
  books: [
    {
      id: 1,
      question: "Who wrote 'Pride and Prejudice'?",
      options: ["Charlotte Brontë", "Jane Austen", "Virginia Woolf", "George Eliot"],
      correct: 1,
      explanation: "'Pride and Prejudice' was written by Jane Austen, published in 1813.",
      category: "Classic Literature",
    },
    {
      id: 2,
      question: "In 'Harry Potter', what is the name of Harry's owl?",
      options: ["Errol", "Pigwidgeon", "Hedwig", "Crookshanks"],
      correct: 2,
      explanation: "Harry Potter's owl is named Hedwig, a snowy owl.",
      category: "Fiction",
    },
    {
      id: 3,
      question: "Who wrote '1984'?",
      options: ["Aldous Huxley", "Ray Bradbury", "George Orwell", "H.G. Wells"],
      correct: 2,
      explanation: "'1984' was written by George Orwell and published in 1949.",
      category: "Dystopian",
    },
    {
      id: 4,
      question: "What is the subtitle of 'The Lord of the Rings: The Fellowship of the Ring'?",
      options: ["The Two Towers", "The Fellowship of the Ring", "The Return of the King", "The Shire"],
      correct: 1,
      explanation: "The first book of the trilogy is 'The Fellowship of the Ring'.",
      category: "Fantasy",
    },
    {
      id: 5,
      question: "Which Shakespeare play features the character Ophelia?",
      options: ["Macbeth", "Othello", "King Lear", "Hamlet"],
      correct: 3,
      explanation: "Ophelia is a character in Shakespeare's 'Hamlet'.",
      category: "Classic Literature",
    },
  ],
}

const QuizPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizStarted, setQuizStarted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [pointsEarned, setPointsEarned] = useState(null)

  const { token } = useAuth()

  const quizQuestions = selectedTopic ? (allQuizQuestions[selectedTopic] || allQuizQuestions.japanese) : []

  const currentTopicInfo = quizTopics.find((t) => t.id === selectedTopic)

  // Timer effect
  useEffect(() => {
    let timer
    if (quizStarted && !showResult && !quizCompleted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, quizStarted, showResult, quizCompleted])

  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizCompleted(false)
    setTimeLeft(30)
    setUserAnswers([])
  }

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleNextQuestion = () => {
    const currentQ = quizQuestions[currentQuestion]
    const isCorrect = selectedAnswer === currentQ.correct

    // Record user answer
    const newAnswer = {
      questionId: currentQ.id,
      selectedAnswer,
      correct: currentQ.correct,
      isCorrect,
      question: currentQ.question,
      explanation: currentQ.explanation,
    }

    setUserAnswers([...userAnswers, newAnswer])

    if (isCorrect) {
      setScore(score + 1)
    }

    setShowResult(true)

    setTimeout(() => {
      if (currentQuestion + 1 < quizQuestions.length) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(30)
      } else {
        const finalScore = isCorrect ? score + 1 : score
        setQuizCompleted(true)

        // Save quiz results to backend (fire-and-forget)
        if (token) {
          fetch("/api/quiz/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              score: finalScore,
              totalQuestions: quizQuestions.length,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.pointsEarned !== undefined) {
                setPointsEarned(data.pointsEarned)
              }
            })
            .catch((err) => console.error("Failed to save quiz results:", err))
        }
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setSelectedTopic(null)
    setQuizStarted(false)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizCompleted(false)
    setTimeLeft(30)
    setUserAnswers([])
    setPointsEarned(null)
  }

  const getScoreColor = () => {
    const percentage = (score / quizQuestions.length) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100
    if (percentage >= 90) return "Excellent! 🎉"
    if (percentage >= 80) return "Great job! 👏"
    if (percentage >= 70) return "Good work! 👍"
    if (percentage >= 60) return "Not bad! 📚"
    return "Keep studying! 💪"
  }

  // Step 1: Topic Selection
  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="mb-4">
              <span className="text-7xl">🧠</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Quiz Challenge</h1>
            <p className="text-lg text-gray-600">Choose a topic to start your quiz</p>
          </div>

          {/* Topic Cards Grid - matching FlashcardDeck design */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {quizTopics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`
                  relative bg-white rounded-2xl shadow-xl cursor-pointer
                  transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2
                  border border-gray-200 overflow-hidden
                `}
              >
                <div className={`h-28 ${topic.color} flex items-center justify-center shadow-inner`}>
                  <span className="text-5xl drop-shadow-lg">{topic.icon}</span>
                </div>
                <div className="p-5 text-center bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{topic.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{topic.subtitle}</p>
                  <p className="text-xs text-indigo-500 font-medium">{topic.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            Each quiz has {Object.values(allQuizQuestions)[0].length}–{Object.values(allQuizQuestions)[2].length} questions · 30 seconds each · 1 point per correct answer
          </p>
        </div>
      </div>
    )
  }

  // Step 2: Quiz Rules / Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className={`inline-block p-6 ${currentTopicInfo?.color} rounded-3xl mb-4 shadow-lg`}>
                <span className="text-7xl">{currentTopicInfo?.icon}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{currentTopicInfo?.title} Quiz</h1>
            <p className="text-lg text-gray-600 mb-8">{currentTopicInfo?.description}</p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quiz Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Questions</h3>
                    <p className="text-sm text-gray-600">{quizQuestions.length} multiple choice questions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Time Limit</h3>
                    <p className="text-sm text-gray-600">30 seconds per question</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Topic</h3>
                    <p className="text-sm text-gray-600">{currentTopicInfo?.description}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h3 className="font-medium text-gray-900">Scoring</h3>
                    <p className="text-sm text-gray-600">1 point per correct answer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSelectedTopic(null)}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 border border-gray-300"
              >
                ← Change Topic
              </button>
              <button
                onClick={startQuiz}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Quiz 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p className="text-lg text-gray-600">{getScoreMessage()}</p>
          </div>

          {/* Score Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
                {score}/{quizQuestions.length}
              </div>
              <div className="text-2xl text-gray-600">{Math.round((score / quizQuestions.length) * 100)}% Correct</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(score / quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{quizQuestions.length - score}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quizQuestions.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((score / quizQuestions.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>

            {/* Points earned banner */}
            {pointsEarned !== null && (
              <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">+{pointsEarned} pts</div>
                <div className="text-sm text-gray-600">Added to your leaderboard score!</div>
              </div>
            )}
          </div>

          {/* Review Answers */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Answers</h2>
            <div className="space-y-4">
              {userAnswers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`p-4 rounded-lg border-l-4 ${
                    answer.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                    <span className={`text-2xl ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {answer.isCorrect ? "✅" : "❌"}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{answer.question}</p>
                  <p className="text-sm text-gray-600 italic">{answer.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            <button
              onClick={resetQuiz}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Take Quiz Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quizQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🧠</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentTopicInfo?.title || "Quiz"}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${timeLeft <= 10 ? "text-red-600" : "text-blue-600"}`}>
                {timeLeft}s
              </div>
              <div className="text-sm text-gray-600">Time left</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Timer Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-1000 ${
                timeLeft <= 10 ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {currentQ.category}
              </span>
              <span className="text-sm text-gray-500">
                Score: {score}/{currentQuestion}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQ.question}</h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === null
                    ? "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    : selectedAnswer === index
                      ? showResult
                        ? index === currentQ.correct
                          ? "border-green-500 bg-green-100 text-green-800"
                          : "border-red-500 bg-red-100 text-red-800"
                        : "border-purple-500 bg-purple-100"
                      : index === currentQ.correct && showResult
                        ? "border-green-500 bg-green-100 text-green-800"
                        : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      selectedAnswer === index
                        ? showResult
                          ? index === currentQ.correct
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-red-500 bg-red-500 text-white"
                          : "border-purple-500 bg-purple-500 text-white"
                        : index === currentQ.correct && showResult
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-300"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Result Display */}
          {showResult && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                selectedAnswer === currentQ.correct
                  ? "bg-green-100 border border-green-300"
                  : "bg-red-100 border border-red-300"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{selectedAnswer === currentQ.correct ? "🎉" : "😔"}</span>
                <span
                  className={`font-bold ${selectedAnswer === currentQ.correct ? "text-green-800" : "text-red-800"}`}
                >
                  {selectedAnswer === currentQ.correct ? "Correct!" : "Incorrect!"}
                </span>
              </div>
              <p className="text-sm text-gray-700">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {selectedAnswer !== null && !showResult && (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {currentQuestion + 1 === quizQuestions.length ? "Finish Quiz" : "Next Question"} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPage
