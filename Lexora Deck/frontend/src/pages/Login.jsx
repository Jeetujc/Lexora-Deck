"use client"
import { AuthProvider } from "../contexts/AuthContext"
import { useAuth } from "../contexts/useAuth"
import AuthPage from "../components/Auth/AuthPage"

function AppContent() {
  const { user, loading, logout } = useAuth()

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
    <div className="App">
      {/* User Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎴</span>
            <h1 className="text-xl font-semibold text-gray-900">Lexora Deck</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}!</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

function Login() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default Login