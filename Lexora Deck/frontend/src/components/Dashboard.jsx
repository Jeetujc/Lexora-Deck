import React from "react"
import { useQuizStats } from "../hooks/useQuizStats"
import { useStreak } from "../hooks/useStreak"

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Dashboard() {
  const { getStats, getHistory } = useQuizStats()
  const { getStreak } = useStreak()

  const stats = getStats()
  const streak = getStreak()
  const history = getHistory()

  const recentHistory = history.slice(0, 5)

  const weakTopics = (() => {
    const topicMap = {}
    history.forEach((h) => {
      if (!topicMap[h.topic]) topicMap[h.topic] = { total: 0, sum: 0, count: 0 }
      topicMap[h.topic].sum += h.percentage
      topicMap[h.topic].count += 1
      topicMap[h.topic].total = Math.round(topicMap[h.topic].sum / topicMap[h.topic].count)
    })
    return Object.entries(topicMap)
      .sort((a, b) => a[1].total - b[1].total)
      .slice(0, 3)
      .map(([topic, data]) => ({ topic, avg: data.total }))
  })()

  if (history.length === 0 && stats.cardsReviewed === 0) {
    return null // hide if no data yet
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
          <p className="text-gray-500 mt-1">Keep up the great work! 🚀</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard icon="🃏" label="Cards Studied" value={stats.cardsReviewed} color="bg-blue-100" />
          <StatCard icon="🧠" label="Quizzes Taken" value={stats.quizzesTaken} color="bg-purple-100" />
          <StatCard icon="🔥" label="Day Streak" value={streak} color="bg-orange-100" />
          <StatCard icon="⭐" label="Total Points" value={stats.totalPoints} color="bg-yellow-100" />
          <StatCard icon="🏆" label="Best Score" value={`${stats.bestScore}%`} color="bg-green-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quiz History */}
          {recentHistory.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Recent Quizzes
              </h3>
              <div className="space-y-3">
                {recentHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                    <div>
                      <p className="font-medium text-gray-800 text-sm capitalize">{h.topic}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.date).toLocaleDateString()} · {h.difficulty || "medium"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          h.percentage >= 80
                            ? "text-green-600"
                            : h.percentage >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {h.percentage}%
                      </span>
                      <p className="text-xs text-gray-400">
                        {h.score}/{h.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Topics */}
          {weakTopics.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📈</span> Topic Performance
              </h3>
              <div className="space-y-4">
                {weakTopics.map(({ topic, avg }) => (
                  <MiniBar
                    key={topic}
                    label={topic.charAt(0).toUpperCase() + topic.slice(1)}
                    value={avg}
                    max={100}
                    color={avg >= 80 ? "bg-green-500" : avg >= 60 ? "bg-yellow-400" : "bg-red-500"}
                  />
                ))}
              </div>
              {weakTopics.some((t) => t.avg < 70) && (
                <p className="mt-4 text-xs text-indigo-600 font-medium">
                  💡 Focus on your weaker topics to improve your score!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
