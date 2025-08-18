"use client"
import { useState } from "react"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./contexts/useAuth"
import AuthPage from "./components/Auth/AuthPage"
import Navbar from "./components/Navbar"
import FlashcardDeck from "./components/FlashcardDeck"
import LeaderboardPage from "./components/Leaderboard/LeaderboardPage"
import QuizPage from "./components/Quiz/QuizPage"
import "./App.css"
import Home from "./pages/Home"

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState("flashcards")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home" :
        return <Home/>
      case "flashcards":
        return <FlashcardDeck />
      case "quiz":
        return <QuizPage />
      case "leaderboard":
        return <LeaderboardPage />
      default:
        return <Home />
    }
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
