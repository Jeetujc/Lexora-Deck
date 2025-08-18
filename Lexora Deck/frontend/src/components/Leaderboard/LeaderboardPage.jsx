"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, token } = useAuth()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leaderboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
      } else {
        setError("Failed to load leaderboard")
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
          <p className="text-lg text-gray-600">See how you rank among Japanese learners!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-900">{leaderboard.length}</div>
            <div className="text-sm text-gray-600">Total Learners</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.reduce((sum, user) => sum + (user?.total_cards_viewed || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Cards Studied</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-gray-900">
              {leaderboard.reduce((sum, user) => sum + (user?.total_points || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">🥇 Top Performers</h2>
            <div className="flex justify-center items-end space-x-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-lg p-6 mb-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="text-white font-bold text-lg">{leaderboard[1]?.name || 'N/A'}</div>
                  <div className="text-gray-100 text-sm">{leaderboard[1]?.total_points || 0} pts</div>
                </div>
                <div className="bg-gray-300 h-20 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-lg p-6 mb-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">🥇</div>
                  <div className="text-white font-bold text-xl">{leaderboard[0]?.name || 'N/A'}</div>
                  <div className="text-yellow-100 text-sm">{leaderboard[0]?.total_points || 0} pts</div>
                </div>
                <div className="bg-yellow-400 h-32 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-t from-orange-400 to-orange-500 rounded-lg p-6 mb-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="text-white font-bold text-lg">{leaderboard[2]?.name || 'N/A'}</div>
                  <div className="text-orange-100 text-sm">{leaderboard[2]?.total_points || 0} pts</div>
                </div>
                <div className="bg-orange-400 h-16 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Full Rankings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {leaderboard.map((userEntry, mapIndex) => (
              <div
                key={userEntry.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  userEntry.id === user?.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(
                        userEntry?.rank || mapIndex + 1,
                      )}`}
                    >
                      {userEntry?.rank || mapIndex + 1}
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {userEntry?.name || 'Unknown User'}
                          {userEntry.id === user?.id && <span className="text-blue-600 text-sm ml-2">(You)</span>}
                        </h3>
                        <span className={`text-lg ${userEntry?.badge?.color || ''}`}>{userEntry?.badge?.emoji || '🎯'}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`flex items-center space-x-1 ${userEntry?.level?.color || ''}`}>
                          <span>{userEntry?.level?.icon || '📚'}</span>
                          <span>{userEntry?.level?.level || 'Beginner'}</span>
                        </span>
                        <span>Joined {userEntry?.created_at ? formatDate(userEntry.created_at) : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{userEntry?.total_points || 0}</div>
                    <div className="text-sm text-gray-600">points</div>
                    <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                      <span>{userEntry?.unique_cards_studied || 0} cards</span>
                      <span>{userEntry?.total_cards_viewed || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-600">Start studying flashcards to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardPage
