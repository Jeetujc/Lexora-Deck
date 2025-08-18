"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

const QuizPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const topic = searchParams.get('topic')
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizStarted, setQuizStarted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Default fallback quiz questions (for backward compatibility)
  const defaultQuizQuestions = [
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
      explanation: "'おはようございます' (Ohayo gozaimasu) means 'Good morning' in Japanese.",
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
  ]

  // Function to generate MCQ questions from flashcard points
  const generateQuestionsFromPoints = (points, topicName) => {
    const questions = []
    
    // Take first 5-8 points to create questions
    const selectedPoints = points.slice(0, Math.min(8, points.length))
    
    selectedPoints.forEach((point, index) => {
      // Create a question about the heading/description
      const question = {
        id: index + 1,
        question: `What is important to know about "${point.heading}" regarding ${topicName}?`,
        options: [
          point.description,
          "This is not related to the topic",
          "This information is outdated",
          "This is incorrect information"
        ],
        correct: 0, // First option is always correct (the actual description)
        explanation: `${point.heading}: ${point.description}`,
        category: topicName
      }
      
      // Shuffle options (except keeping correct answer trackable)
      const correctAnswer = question.options[0]
      const shuffledOptions = [...question.options]
      
      // Simple shuffle
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]]
      }
      
      // Find where the correct answer ended up
      question.options = shuffledOptions
      question.correct = shuffledOptions.indexOf(correctAnswer)
      
      questions.push(question)
    })
    
    return questions
  }

  // Function to fetch topic-based questions
  const fetchTopicQuestions = async (topicName) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("🚀 Fetching quiz data for topic:", topicName)
      
      const response = await fetch("/api/gemini/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardName: topicName,
          category: "quiz",
        }),
      })
      
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.points && data.points.length > 0) {
        const generatedQuestions = generateQuestionsFromPoints(data.points, topicName)
        setQuizQuestions(generatedQuestions)
        console.log("✅ Generated", generatedQuestions.length, "questions from API")
      } else {
        throw new Error("No points received from API")
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch topic questions:", error)
      setError(`Failed to load quiz for "${topicName}". Using default quiz.`)
      setQuizQuestions(defaultQuizQuestions)
    } finally {
      setLoading(false)
    }
  }

  // Effect to load questions when component mounts or topic changes
  useEffect(() => {
    if (topic) {
      fetchTopicQuestions(topic)
    } else {
      setQuizQuestions(defaultQuizQuestions)
    }
  }, [topic])

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
        setQuizCompleted(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizCompleted(false)
    setTimeLeft(30)
    setUserAnswers([])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-8xl">🧠</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading Quiz...</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Generating questions for {topic || 'general topics'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-8xl">🧠</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {topic ? `${topic} Quiz Challenge` : 'Japanese Quiz Challenge'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {topic ? `Test your knowledge about ${topic}!` : 'Test your Japanese knowledge with our interactive quiz!'}
            </p>

            {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <p className="text-sm">{error}</p>
              </div>
            )}

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
                    <h3 className="font-medium text-gray-900">Topics</h3>
                    <p className="text-sm text-gray-600">
                      {topic ? topic : 'Vocabulary, Hiragana, Numbers'}
                    </p>
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

            <button
              onClick={startQuiz}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Quiz 🚀
            </button>
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
              onClick={() => navigate('/flashcards')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Back to Flashcards
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {topic ? `${topic} Quiz` : 'Japanese Quiz'}
                </h1>
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
