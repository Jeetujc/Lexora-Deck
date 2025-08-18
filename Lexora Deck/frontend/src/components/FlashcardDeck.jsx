"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const FlashcardDeck = () => {
  const navigate = useNavigate()
  const [flippedCard, setFlippedCard] = useState(null)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [backCards, setBackCards] = useState([])
  const [currentBackCardIndex, setCurrentBackCardIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userInput, setUserInput] = useState("")
  const [showInputModal, setShowInputModal] = useState(false)

  const cards = [
    // First row (3 cards)
    {
      id: 1,
      title: "Finance",
      subtitle: "About Finance",
      icon: "₹",
      color: "bg-blue-100",
      category: "transportation",
    },
    {
      id: 2,
      title: "Health Studies",
      subtitle: "Health",
      icon: "🩺",
      color: "bg-green-100",
      category: "transportation",
    },
    {
      id: 3,
      title: "Random",
      subtitle: "Fun Topics",
      icon: "✨",
      color: "bg-purple-100",
      category: "finance",
    },
    // Second row (4 cards)
    {
      id: 4,
      title: "Coding",
      subtitle: "Coders",
      icon: "👨🏻‍💻",
      color: "bg-yellow-100",
      category: "finance",
    },
    {
      id: 5,
      title: "English",
      subtitle: "Language",
      icon: "🔠",
      color: "bg-red-100",
      category: "places",
    },
    {
      id: 6,
      title: "Gym",
      subtitle: "GYM",
      icon: "🏋🏻‍♀️",
      color: "bg-orange-100",
      category: "food",
    },
    {
      id: 7,
      title: "Book",
      subtitle: "BOOK Lovers",
      icon: "📚",
      color: "bg-indigo-100",
      category: "education",
    },
    // Third row (4 cards) - Added the new search card
    {
      id: 8,
      title: "House Affordability",
      subtitle: "House Finace",
      icon: "🏠",
      color: "bg-pink-100",
      category: "places",
    },
    {
      id: 9,
      title: "For car Enthuasists",
      subtitle: "Car",
      icon: "🚗",
      color: "bg-teal-100",
      category: "transportation",
    },
    {
      id: 10,
      title: "Food",
      subtitle: "FOOD",
      icon: "🍱",
      color: "bg-lime-100",
      category: "food",
    },
    {
      id: 11,
      title: "Search",
      subtitle: "Custom Search",
      icon: "🔍",
      color: "bg-cyan-100",
      category: "search",
      isSearchCard: true,
    },
  ]

  // Function to fetch related cards from Next.js API backend
  const fetchBackCards = async (cardId, category, cardTitle) => {
    setLoading(true)
    setError(null)
    setCurrentBackCardIndex(0)

    try {
      console.log("🚀 Fetching data for:", { cardTitle, category })

      // API call to Next.js backend (will be proxied by Vite)
      const response = await fetch("/api/gemini/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardName: cardTitle,
          category: category,
        }),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response ok:", response.ok)

      // First check if the response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`API Error (${response.status}): ${errorText || "Unknown error"}`)
      }

      // Safely parse the JSON response
      let data
      try {
        const responseText = await response.text()
        console.log("📄 Response text length:", responseText.length)
        console.log("📄 Response text preview:", responseText.substring(0, 100) + "...")

        if (!responseText || responseText.trim() === "") {
          throw new Error("Empty response from server")
        }

        data = JSON.parse(responseText)
        console.log("✅ Parsed data:", data)
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError)
        throw new Error(`Failed to parse response: ${parseError.message}`)
      }

      // Handle both successful and fallback responses
      if (data.points && Array.isArray(data.points)) {
        setBackCards(data.points)
        if (data.fallback || data.error) {
          setError(`Note: ${data.error || "Using fallback data - API temporarily unavailable"}`)
        }
      } else {
        throw new Error(data.error || "Invalid response format")
      }
    } catch (err) {
      console.error("❌ Error fetching cards:", err)
      setError(`Failed to load information: ${err.message}`)

      // Fallback to local sample data if everything fails
      const fallbackData = [
        {
          heading: `About ${cardTitle}`,
          description: `${cardTitle} is a ${category} related term. This is sample data shown when the API is unavailable. Normally, this would display detailed information from Gemini AI.`,
        },
        {
          heading: "General Usage",
          description: `${cardTitle} is commonly used in daily life. This sample content demonstrates how the information would be displayed when the API is working properly.`,
        },
        {
          heading: "Cultural Context",
          description: `In Japanese culture, ${cardTitle} has specific significance and usage patterns. This would contain real cultural insights when connected to the AI service.`,
        },
      ]
      setBackCards(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  // Test API function
  const testAPI = async () => {
    try {
      console.log("🧪 Testing API endpoint...")
      const response = await fetch("/api/gemini/cards")
      const data = await response.json()
      console.log("🧪 API Test Result:", data)
      alert(`API Test: ${data.message || "Success!"}`)
    } catch (error) {
      console.error("🧪 API Test Failed:", error)
      alert(`API Test Failed: ${error.message}`)
    }
  }

  const handleCardClick = async (card) => {
    if (card.isSearchCard) {
      setShowInputModal(true)
      return
    }
    
    setFlippedCard(card)
    setIsCardFlipped(false)
    // Fetch related cards from Gemini API
    await fetchBackCards(card.id, card.category, card.title)
    // Small delay to show the card expanding before flipping
    setTimeout(() => setIsCardFlipped(true), 300)
  }

  const handleSearchSubmit = async () => {
    if (!userInput.trim()) return
    
    const searchCard = {
      id: 11,
      title: userInput,
      subtitle: "Custom Search",
      icon: "🔍",
      color: "bg-cyan-100",
      category: "search",
    }
    
    setShowInputModal(false)
    setFlippedCard(searchCard)
    setIsCardFlipped(false)
    
    // Fetch related cards based on user input
    await fetchBackCards(searchCard.id, "general", userInput)
    setTimeout(() => setIsCardFlipped(true), 300)
    
    // Clear the input for next time
    setUserInput("")
  }

  const handleCloseCard = () => {
    setIsCardFlipped(false)
    setTimeout(() => {
      setFlippedCard(null)
      setBackCards([])
      setCurrentBackCardIndex(0)
      setError(null)
    }, 300)
  }

  const handleCardFlip = () => {
    setIsCardFlipped(!isCardFlipped)
  }

  const handleNextCard = (e) => {
    e.stopPropagation()
    if (currentBackCardIndex < backCards.length - 1) {
      setCurrentBackCardIndex(currentBackCardIndex + 1)
    }
  }

  const handlePrevCard = (e) => {
    e.stopPropagation()
    if (currentBackCardIndex > 0) {
      setCurrentBackCardIndex(currentBackCardIndex - 1)
    }
  }

  const getCardRotation = (index) => {
    const rotations = [
      "rotate-12",
      "-rotate-6",
      "rotate-3",
      "-rotate-12",
      "rotate-6",
      "-rotate-3",
      "rotate-12",
      "rotate-6",
      "-rotate-12",
      "rotate-3",
      "-rotate-6",
    ]
    return rotations[index]
  }

  const getCardTransform = (index) => {
    const transforms = [
      "translate-x-2 translate-y-1",
      "-translate-x-1 translate-y-2",
      "translate-x-1 -translate-y-1",
      "-translate-x-2 translate-y-3",
      "translate-x-3 -translate-y-2",
      "-translate-x-1 translate-y-1",
      "translate-x-2 translate-y-2",
      "-translate-x-3 -translate-y-1",
      "translate-x-1 translate-y-3",
      "-translate-x-2 -translate-y-2",
      "translate-x-2 translate-y-1",
    ]
    return transforms[index]
  }

  const currentBackCard = backCards[currentBackCardIndex]

  return (
    <div className="min-h-screen bg-white p-8 perspective-1000">
      {/* Test API Button */}
      <button
        onClick={testAPI}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors duration-200"
      >
        🧪 Test API
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">Lexora FlashCards</h1>

        {/* First Row - 3 cards */}
        <div className="flex justify-center items-center mb-16 gap-8 preserve-3d">
          {cards.slice(0, 3).map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative w-48 h-64 bg-white rounded-2xl shadow-2xl cursor-pointer
                transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:-translate-y-2
                ${getCardRotation(index)} ${getCardTransform(index)}
                border border-gray-200 preserve-3d
                hover:rotate-y-5 hover:rotate-x-5
              `}
              style={{
                transformStyle: "preserve-3d",
                transform: `${getCardRotation(index).replace("rotate-", "rotateZ(")}deg) translateZ(${index * 2}px)`,
              }}
            >
              <div className={`h-32 ${card.color} rounded-t-2xl flex items-center justify-center shadow-inner`}>
                <span className="text-6xl drop-shadow-lg">{card.icon}</span>
              </div>
              <div className="p-6 text-center bg-gradient-to-b from-white to-gray-50 rounded-b-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.subtitle}</h3>
                <p className="text-lg text-gray-600">{card.title}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Second Row - 4 cards */}
        <div className="flex justify-center items-center mb-16 gap-6 preserve-3d">
          {cards.slice(3, 7).map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative w-44 h-60 bg-white rounded-2xl shadow-2xl cursor-pointer
                transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:-translate-y-2
                ${getCardRotation(index + 3)} ${getCardTransform(index + 3)}
                border border-gray-200 preserve-3d
                hover:rotate-y-5 hover:rotate-x-5
              `}
              style={{
                transformStyle: "preserve-3d",
                transform: `${getCardRotation(index + 3).replace("rotate-", "rotateZ(")}deg) translateZ(${(index + 3) * 2}px)`,
              }}
            >
              <div className={`h-28 ${card.color} rounded-t-2xl flex items-center justify-center shadow-inner`}>
                <span className="text-5xl drop-shadow-lg">{card.icon}</span>
              </div>
              <div className="p-4 text-center bg-gradient-to-b from-white to-gray-50 rounded-b-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{card.subtitle}</h3>
                <p className="text-base text-gray-600">{card.title}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Third Row - 3 cards */}
        <div className="flex justify-center items-center mb-16 gap-8 preserve-3d">
          {cards.slice(7, 10).map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative w-48 h-64 bg-white rounded-2xl shadow-2xl cursor-pointer
                transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:-translate-y-2
                ${getCardRotation(index + 7)} ${getCardTransform(index + 7)}
                border border-gray-200 preserve-3d
                hover:rotate-y-5 hover:rotate-x-5
              `}
              style={{
                transformStyle: "preserve-3d",
                transform: `${getCardRotation(index + 7).replace("rotate-", "rotateZ(")}deg) translateZ(${(index + 7) * 2}px)`,
              }}
            >
              <div className={`h-32 ${card.color} rounded-t-2xl flex items-center justify-center shadow-inner`}>
                <span className="text-6xl drop-shadow-lg">{card.icon}</span>
              </div>
              <div className="p-6 text-center bg-gradient-to-b from-white to-gray-50 rounded-b-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.subtitle}</h3>
                <p className="text-lg text-gray-600">{card.title}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Fourth Row - Custom Search Card */}
        <div className="flex justify-center items-center preserve-3d">
          {cards.slice(10, 11).map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative w-52 h-68 bg-white rounded-2xl shadow-2xl cursor-pointer
                transform transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:-translate-y-2
                ${getCardRotation(index + 10)} ${getCardTransform(index + 10)}
                border border-gray-200 preserve-3d
                hover:rotate-y-5 hover:rotate-x-5
                ring-2 ring-cyan-300 ring-opacity-50 shadow-cyan-200/50
              `}
              style={{
                transformStyle: "preserve-3d",
                transform: `${getCardRotation(index + 10).replace("rotate-", "rotateZ(")}deg) translateZ(${(index + 10) * 2}px)`,
              }}
            >
              <div className={`h-36 ${card.color} rounded-t-2xl flex items-center justify-center shadow-inner relative overflow-hidden`}>
                <span className="text-7xl drop-shadow-lg relative z-10">{card.icon}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/30 to-transparent"></div>
              </div>
              <div className="p-6 text-center bg-gradient-to-b from-white to-gray-50 rounded-b-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.subtitle}</h3>
                <p className="text-lg text-gray-600 mb-2">{card.title}</p>
                <p className="text-sm text-cyan-600 font-medium">Click to search anything!</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Modal for Search Card */}
      {showInputModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={() => setShowInputModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-3xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Custom Search</h2>
              <p className="text-gray-600">Enter any topic you'd like to explore</p>
            </div>
            
            <div className="mb-6">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="e.g., Artificial Intelligence, Space Exploration..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none text-gray-800 placeholder-gray-400"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowInputModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSearchSubmit}
                disabled={!userInput.trim()}
                className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 text-white rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Card Overlay */}
      {flippedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={handleCloseCard}
        >
          <div
            className="relative w-[600px] h-[500px] preserve-3d cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              handleCardFlip()
            }}
            style={{
              transformStyle: "preserve-3d",
              transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.6s",
            }}
          >
            {/* Front of card */}
            <div
              className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-3xl backface-hidden border-2 border-gray-200"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className={`h-48 ${flippedCard.color} rounded-t-3xl flex items-center justify-center shadow-inner`}>
                <span className="text-8xl drop-shadow-lg">{flippedCard.icon}</span>
              </div>
              <div className="p-8 text-center bg-gradient-to-b from-white to-gray-50 rounded-b-3xl h-[calc(100%-12rem)] flex flex-col justify-center">
                <h3 className="text-4xl font-bold text-gray-800 mb-4">{flippedCard.subtitle}</h3>
                <p className="text-2xl text-gray-600 mb-6">{flippedCard.title}</p>
                <p className="text-sm text-gray-500">Click to see related information</p>
              </div>
            </div>

            {/* Back of card - Single card with navigation */}
            <div
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-3xl backface-hidden border-2 border-gray-600 text-white overflow-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">About {flippedCard.title}</h3>
                  {backCards.length > 0 && (
                    <div className="text-sm text-gray-300">
                      {currentBackCardIndex + 1} of {backCards.length}
                    </div>
                  )}
                </div>

                {loading && (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading information from Gemini AI...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">{error}</p>
                  </div>
                )}

                {!loading && currentBackCard && (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <h4 className="text-2xl font-bold text-white mb-4">{currentBackCard.heading}</h4>
                      <p className="text-gray-300 leading-relaxed">{currentBackCard.description}</p>
                    </div>
                  </div>
                )}

                {!loading && backCards.length === 0 && (
                  <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-300 text-center">No information found</p>
                  </div>
                )}

                {/* Take Quiz Button */}
                {flippedCard && !flippedCard.isSearchCard && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate(`/quiz?topic=${encodeURIComponent(flippedCard.title)}`)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      🧠 Take Quiz on {flippedCard.title}
                    </button>
                  </div>
                )}

                {/* Navigation buttons */}
                {backCards.length > 1 && !loading && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={handlePrevCard}
                      disabled={currentBackCardIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:opacity-50 rounded-lg transition-all duration-200 text-white disabled:cursor-not-allowed"
                    >
                      <span>←</span>
                      <span>Previous</span>
                    </button>

                    <div className="flex gap-2">
                      {backCards.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentBackCardIndex ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextCard}
                      disabled={currentBackCardIndex === backCards.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:opacity-50 rounded-lg transition-all duration-200 text-white disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <span>→</span>
                    </button>
                  </div>
                )}

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-400">Click card to flip back</p>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleCloseCard}
            className="absolute top-8 right-8 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-200 backdrop-blur-sm"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default FlashcardDeck