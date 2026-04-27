import React from "react"
import { useAchievements, ACHIEVEMENTS } from "../hooks/useAchievements"

function Achievements() {
  const { getUnlocked } = useAchievements()
  const unlocked = getUnlocked()

  const allAchievements = Object.values(ACHIEVEMENTS)
  const unlockedCount = unlocked.length

  if (unlockedCount === 0) return null

  return (
    <div className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🏅 Achievements
            <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {unlockedCount}/{allAchievements.length}
            </span>
          </h2>
          <p className="text-gray-500 mt-1">Your earned badges</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {allAchievements.map((achievement) => {
            const isUnlocked = unlocked.includes(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`rounded-2xl p-4 text-center border transition-all duration-200 ${
                  isUnlocked
                    ? "bg-white border-yellow-200 shadow-md"
                    : "bg-gray-100 border-gray-200 opacity-50 grayscale"
                }`}
              >
                <div className="text-4xl mb-2">{achievement.emoji}</div>
                <p className={`font-semibold text-sm ${isUnlocked ? "text-gray-900" : "text-gray-500"}`}>
                  {achievement.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                {!isUnlocked && (
                  <p className="text-xs text-indigo-400 mt-2 font-medium">🔒 Locked</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Achievements
