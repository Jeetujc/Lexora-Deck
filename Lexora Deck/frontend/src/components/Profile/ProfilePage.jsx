"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../../hooks/useToast"
import Toast from "../Toast"

const ProfilePage = ({ onPageChange }) => {
  const { user, token, logout } = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const [stats, setStats] = useState({
    points: 0,
    streak: 0,
    cardsReviewed: 0,
    quizzesTaken: 0,
  })
  const [savedNotes, setSavedNotes] = useState([])
  const [savedDecks, setSavedDecks] = useState([])
  const [showNotes, setShowNotes] = useState(false)
  const [showDecks, setShowDecks] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchUserStats()
    loadSavedData()
  }, [])

  const fetchUserStats = async () => {
    setLoadingStats(true)
    try {
      if (token) {
        const response = await fetch("/api/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          const currentUser = data.leaderboard?.find((u) => u.id === user?.id)
          if (currentUser) {
            setStats((prev) => ({
              ...prev,
              points: currentUser.points || 0,
              streak: currentUser.streak || 0,
            }))
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadSavedData = () => {
    const notes = JSON.parse(localStorage.getItem("savedNotes") || "[]")
    const decks = JSON.parse(localStorage.getItem("savedDecks") || "[]")
    setSavedNotes(notes)
    setSavedDecks(decks)
    setStats((prev) => ({
      ...prev,
      cardsReviewed: parseInt(localStorage.getItem("cardsReviewed") || "0"),
      quizzesTaken: parseInt(localStorage.getItem("quizzesTaken") || "0"),
    }))
  }

  const handleSaveDeck = () => {
    const deckData = {
      id: Date.now(),
      name: `My Deck - ${new Date().toLocaleDateString()}`,
      savedAt: new Date().toISOString(),
      cardCount: 11,
      topics: ["Finance", "Health", "Coding", "English", "Gym", "Books"],
    }
    const updated = [...savedDecks, deckData]
    setSavedDecks(updated)
    localStorage.setItem("savedDecks", JSON.stringify(updated))
    toast({ message: "Deck saved successfully! 🎉", type: "success" })
  }

  const handleDeleteNote = (id) => {
    const updated = savedNotes.filter((n) => n.id !== id)
    setSavedNotes(updated)
    localStorage.setItem("savedNotes", JSON.stringify(updated))
  }

  const handleDeleteDeck = (id) => {
    const updated = savedDecks.filter((d) => d.id !== id)
    setSavedDecks(updated)
    localStorage.setItem("savedDecks", JSON.stringify(updated))
  }

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStreakMessage = (streak) => {
    if (streak === 0) return "Start your streak today! 🌱"
    if (streak < 3) return "Keep it up! 🔥"
    if (streak < 7) return "You're on fire! 🔥🔥"
    if (streak < 14) return "Unstoppable! 🚀"
    return "Legend status! 🏆"
  }

  const statCards = [
    {
      label: "Points Earned",
      value: stats.points,
      icon: "⭐",
      color: "from-yellow-400 to-orange-500",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      label: "Daily Streak",
      value: `${stats.streak} days`,
      icon: "🔥",
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label: "Cards Reviewed",
      value: stats.cardsReviewed,
      icon: "📚",
      color: "from-blue-400 to-indigo-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Quizzes Taken",
      value: stats.quizzesTaken,
      icon: "🧠",
      color: "from-purple-400 to-pink-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <Toast toasts={toasts} dismiss={dismiss} />
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Cover banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white">
                <span className="text-white text-3xl font-bold">{getInitials(user?.name)}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all duration-200 border border-red-200"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>

            {/* User info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h1>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <span>✉️</span>
                {user?.email || "user@example.com"}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  🎓 Learner
                </span>
                {stats.streak > 0 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    🔥 {stats.streak} day streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} border ${stat.border} rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {loadingStats ? "..." : stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Streak message */}
        {stats.streak >= 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="font-semibold text-gray-800">{getStreakMessage(stats.streak)}</p>
              <p className="text-sm text-gray-500">
                {stats.streak === 0
                  ? "Complete a quiz or review flashcards to start your streak"
                  : `You've been learning for ${stats.streak} consecutive days`}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["overview", "notes", "decks"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl font-medium capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200"
              }`}
            >
              {tab === "overview" && "📊 "}
              {tab === "notes" && "📝 "}
              {tab === "decks" && "🗂️ "}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleSaveDeck}
                  className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all duration-200 border border-indigo-200"
                >
                  <span className="text-2xl">💾</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Save Deck</p>
                    <p className="text-xs text-indigo-500">Export current deck</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all duration-200 border border-green-200"
                >
                  <span className="text-2xl">📝</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm">View Notes</p>
                    <p className="text-xs text-green-500">{savedNotes.length} saved notes</p>
                  </div>
                </button>
                <button
                  onClick={() => onPageChange && onPageChange("quiz")}
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all duration-200 border border-purple-200"
                >
                  <span className="text-2xl">🧠</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Take Quiz</p>
                    <p className="text-xs text-purple-500">Earn more points</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Learning Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Cards Reviewed</span>
                    <span>{Math.min(stats.cardsReviewed, 100)}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.cardsReviewed / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Quiz Mastery</span>
                    <span>{Math.min(stats.quizzesTaken * 10, 100)}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.quizzesTaken * 10, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Streak Goal (7 days)</span>
                    <span>{Math.min(stats.streak, 7)}/7</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.streak / 7) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">📝 Saved Notes</h2>
              <span className="text-sm text-gray-500">{savedNotes.length} notes</span>
            </div>
            {savedNotes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 font-medium">No saved notes yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Notes you save while studying will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex justify-between items-start p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{note.title || "Untitled Note"}</p>
                      <p className="text-sm text-gray-500 mt-1">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(note.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-3 text-red-400 hover:text-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "decks" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">🗂️ Saved Decks</h2>
              <button
                onClick={handleSaveDeck}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                + Save Current Deck
              </button>
            </div>
            {savedDecks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 font-medium">No saved decks yet</p>
                <p className="text-sm text-gray-400 mt-1">Save your current deck to access it later</p>
                <button
                  onClick={handleSaveDeck}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Save Current Deck
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{deck.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {deck.cardCount} cards · {new Date(deck.savedAt).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {deck.topics?.slice(0, 3).map((topic) => (
                            <span key={topic} className="text-xs px-2 py-0.5 bg-white rounded-full text-indigo-600 border border-indigo-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
