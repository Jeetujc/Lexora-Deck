"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { FlashcardProgressProvider } from "./contexts/FlashcardProgressContext"
import AuthPage from "./components/Auth/AuthPage"
import Navbar from "./components/Navbar"
import FlashcardDeck from "./components/FlashcardDeck"
import LeaderboardPage from "./components/Leaderboard/LeaderboardPage"
import QuizPage from "./components/Quiz/QuizPage"
import "./App.css"
import Home from "./pages/Home"

function AppContent() {
  const { user, loading } = useAuth()

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

  return (
    <Router>
      <FlashcardProgressProvider>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/flashcards" element={<FlashcardDeck />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<Home />} />
          </Routes>
        </div>
      </FlashcardProgressProvider>
    </Router>
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
