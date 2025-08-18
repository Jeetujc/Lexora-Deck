"use client"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"
import FlashcardDeck from "./components/FlashcardDeck"
import LeaderboardPage from "./components/Leaderboard/LeaderboardPage"
import QuizPage from "./components/Quiz/QuizPage"
import "./App.css"
import Home from "./pages/Home"

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gray-50">
        <ProtectedRoute>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/flashcards" element={<FlashcardDeck />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </ProtectedRoute>
      </div>
    </AuthProvider>
  )
}

export default App
