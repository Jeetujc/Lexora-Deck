"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { FlashcardProvider } from "./contexts/FlashcardContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AuthPage from "./components/Auth/AuthPage"
import Navbar from "./components/Navbar"
import FlashcardDeck from "./components/FlashcardDeck"
import LeaderboardPage from "./components/Leaderboard/LeaderboardPage"
import QuizPage from "./components/Quiz/QuizPage"
import "./App.css"
import Home from "./pages/Home"

function AppContent() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/flashcards" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/flashcards" element={<FlashcardDeck />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="*" element={<Navigate to="/flashcards" replace />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <FlashcardProvider>
        <AppContent />
      </FlashcardProvider>
    </AuthProvider>
  )
}

export default App
