"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const QuizPage = () => {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizStarted, setQuizStarted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [questionError, setQuestionError] = useState(null)

  // Available flashcard topics to generate questions from
  const flashcardTopics = [
    { title: "Finance", category: "finance" },
    { title: "Health Studies", category: "health" },
    { title: "Random", category: "general" },
    { title: "Coding", category: "technology" },
    { title: "English", category: "language" },
    { title: "Gym", category: "fitness" },
    { title: "Book", category: "education" },
    { title: "House Affordability", category: "finance" },
    { title: "For car Enthuasists", category: "transportation" },
    { title: "Food", category: "food" },
  ]

  // Function to generate quiz questions from flashcard data
  const generateQuizQuestions = useCallback(async () => {
    setLoadingQuestions(true)
    setQuestionError(null)
    
    try {
      const generatedQuestions = []
      
      // Select 3-5 random topics from flashcards to create diverse questions
      const selectedTopics = flashcardTopics
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(5, flashcardTopics.length))
      
      for (const topic of selectedTopics) {
        try {
          // Fetch flashcard data for this topic
          const response = await fetch("/api/gemini/cards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cardName: topic.title,
              category: topic.category,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            
            // Generate 1-2 questions per topic from the returned data
            if (data.points && data.points.length > 0) {
              const questionsFromTopic = await generateQuestionsFromFlashcardData(
                data.points, 
                topic.title, 
                topic.category,
                Math.min(2, Math.ceil(8 / selectedTopics.length))
              )
              generatedQuestions.push(...questionsFromTopic)
            }
          }
        } catch (topicError) {
          console.error(`Error fetching data for topic ${topic.title}:`, topicError)
          // Continue with other topics even if one fails
        }
      }
      
      // If we couldn't generate enough questions, add some fallback questions
      if (generatedQuestions.length < 5) {
        const fallbackQuestions = getFallbackQuestions()
        generatedQuestions.push(...fallbackQuestions.slice(0, 8 - generatedQuestions.length))
      }
      
      // Limit to 8 questions and shuffle
      const finalQuestions = generatedQuestions
        .slice(0, 8)
        .sort(() => 0.5 - Math.random())
      
      setQuizQuestions(finalQuestions)
    } catch (error) {
      console.error("Error generating quiz questions:", error)
      setQuestionError("Failed to generate quiz questions. Using fallback questions.")
      // Use fallback questions if API fails
      setQuizQuestions(getFallbackQuestions())
    } finally {
      setLoadingQuestions(false)
    }
  }, [flashcardTopics])

  // Helper function to generate questions from flashcard data
  const generateQuestionsFromFlashcardData = async (flashcardPoints, topicTitle, category, count) => {
    const questions = []
    const usedPoints = new Set()
    
    for (let i = 0; i < count && flashcardPoints.length > 0; i++) {
      // Select a random point that hasn't been used
      let pointIndex
      do {
        pointIndex = Math.floor(Math.random() * flashcardPoints.length)
      } while (usedPoints.has(pointIndex) && usedPoints.size < flashcardPoints.length)
      
      if (usedPoints.has(pointIndex)) break // No more unique points available
      
      usedPoints.add(pointIndex)
      const point = flashcardPoints[pointIndex]
      
      // Create a question from this flashcard point
      const question = createQuestionFromPoint(point, topicTitle, category, questions.length + 1)
      if (question) {
        questions.push(question)
      }
    }
    
    return questions
  }

  // Helper function to create a question from a flashcard point
  const createQuestionFromPoint = (point, topicTitle, category, id) => {
    const questionTypes = ['definition', 'application', 'true-false']
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    
    switch (questionType) {
      case 'definition': {
        const correctAnswer = point.description.split('.')[0] + '.'
        const wrongAnswers = [
          generateWrongAnswer(category, 'definition'),
          generateWrongAnswer(category, 'definition'),
          generateWrongAnswer(category, 'definition')
        ]
        const allOptions = [correctAnswer, ...wrongAnswers]
        const shuffledOptions = allOptions.sort(() => 0.5 - Math.random())
        const correctIndex = shuffledOptions.indexOf(correctAnswer)
        
        return {
          id,
          question: `What is the main concept described in "${point.heading}" related to ${topicTitle}?`,
          options: shuffledOptions,
          correct: correctIndex,
          explanation: `${point.heading}: ${point.description}`,
          category: category,
        }
      }
      
      case 'application': {
        const correctAppAnswer = extractKeyFact(point.description)
        const wrongAppAnswers = [
          generateWrongAnswer(category, 'application'),
          generateWrongAnswer(category, 'application'),
          generateWrongAnswer(category, 'application')
        ]
        const allAppOptions = [correctAppAnswer, ...wrongAppAnswers]
        const shuffledAppOptions = allAppOptions.sort(() => 0.5 - Math.random())
        const correctAppIndex = shuffledAppOptions.indexOf(correctAppAnswer)
        
        return {
          id,
          question: `According to the information about "${point.heading}", which statement is most accurate?`,
          options: shuffledAppOptions,
          correct: correctAppIndex,
          explanation: `${point.heading}: ${point.description}`,
          category: category,
        }
      }
      
      case 'true-false': {
        const isTrue = Math.random() > 0.5
        return {
          id,
          question: `True or False: ${point.heading} - ${extractKeyFact(point.description)}`,
          options: ['True', 'False'],
          correct: isTrue ? 0 : 1,
          explanation: `${point.heading}: ${point.description}`,
          category: category,
        }
      }
      
      default:
        return null
    }
  }

  // Helper function to extract key facts from descriptions
  const extractKeyFact = (description) => {
    const sentences = description.split('.').filter(s => s.trim().length > 10)
    return sentences[0]?.trim() + '.' || description.substring(0, 100) + '...'
  }

  // Helper function to generate wrong answers
  const generateWrongAnswer = (category) => {
    const wrongAnswers = {
      finance: ['Decreased market volatility', 'Reduced investment risk', 'Lower interest rates'],
      health: ['Immediate symptom relief', 'No side effects', 'Instant cure'],
      technology: ['Slower processing speed', 'Reduced functionality', 'No compatibility'],
      education: ['Less learning retention', 'Decreased comprehension', 'No practical application'],
      general: ['No significant impact', 'Completely unrelated', 'Not applicable'],
    }
    
    const categoryAnswers = wrongAnswers[category] || wrongAnswers.general
    return categoryAnswers[Math.floor(Math.random() * categoryAnswers.length)]
  }

  // Fallback questions if API fails
  const getFallbackQuestions = () => [
    {
      id: 1,
      question: "What is a key benefit of financial planning?",
      options: ["Spending more money", "Better financial security", "Avoiding all investments", "Ignoring budgets"],
      correct: 1,
      explanation: "Financial planning helps provide better financial security and stability.",
      category: "Finance",
    },
    {
      id: 2,
      question: "Which is an important aspect of health studies?",
      options: ["Ignoring symptoms", "Regular health monitoring", "Avoiding doctors", "Only emergency care"],
      correct: 1,
      explanation: "Regular health monitoring is crucial for maintaining good health.",
      category: "Health",
    },
    {
      id: 3,
      question: "What is a fundamental concept in coding?",
      options: ["Avoiding documentation", "Writing clear, maintainable code", "Using only one programming language", "Never testing code"],
      correct: 1,
      explanation: "Writing clear, maintainable code is essential for successful software development.",
      category: "Technology",
    },
    {
      id: 4,
      question: "What is a benefit of regular exercise?",
      options: ["Increased fatigue", "Improved cardiovascular health", "Decreased energy", "Reduced strength"],
      correct: 1,
      explanation: "Regular exercise improves cardiovascular health and overall fitness.",
      category: "Fitness",
    },
    {
      id: 5,
      question: "Why is reading important?",
      options: ["It wastes time", "It expands knowledge and vocabulary", "It causes eye strain", "It's only for entertainment"],
      correct: 1,
      explanation: "Reading expands knowledge, improves vocabulary, and enhances cognitive abilities.",
      category: "Education",
    },
  ]

  const handleNextQuestion = useCallback(() => {
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
  }, [quizQuestions, currentQuestion, selectedAnswer, userAnswers, score])

  // Generate quiz questions on component mount
  useEffect(() => {
    generateQuizQuestions()
  }, [])

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
  }, [timeLeft, quizStarted, showResult, quizCompleted, handleNextQuestion])

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

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizCompleted(false)
    setTimeLeft(30)
    setUserAnswers([])
    // Generate new questions for next quiz
    generateQuizQuestions()
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

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-8xl">🧠</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Challenge</h1>
            <p className="text-lg text-gray-600 mb-8">Test your knowledge with our interactive quiz based on flashcard topics!</p>

            {loadingQuestions && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Generating questions from flashcard topics...</p>
                </div>
              </div>
            )}

            {questionError && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-2xl mx-auto">
                <div className="text-red-600 mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-600 mb-4">{questionError}</p>
                <button
                  onClick={generateQuizQuestions}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loadingQuestions && !questionError && (
              <>
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
                        <p className="text-sm text-gray-600">Based on your flashcard topics</p>
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
                  disabled={quizQuestions.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  {quizQuestions.length === 0 ? 'Preparing Quiz...' : `Start Quiz (${quizQuestions.length} Questions)`}
                </button>
              </>
            )}
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
              onClick={() => navigate('/home')}
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
                <h1 className="text-2xl font-bold text-gray-900">Japanese Quiz</h1>
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
