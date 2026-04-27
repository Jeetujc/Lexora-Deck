import { useCallback } from "react"

export const ACHIEVEMENTS = {
  FIRST_QUIZ: {
    id: "FIRST_QUIZ",
    title: "First Quiz!",
    emoji: "🎯",
    description: "Completed your first quiz",
  },
  QUIZ_5: {
    id: "QUIZ_5",
    title: "Quiz Enthusiast",
    emoji: "🔥",
    description: "Completed 5 quizzes",
  },
  QUIZ_10: {
    id: "QUIZ_10",
    title: "Quiz Master",
    emoji: "🏆",
    description: "Completed 10 quizzes",
  },
  PERFECT_SCORE: {
    id: "PERFECT_SCORE",
    title: "Perfect Score!",
    emoji: "⭐",
    description: "Got 100% on a quiz",
  },
  STREAK_3: {
    id: "STREAK_3",
    title: "3-Day Streak",
    emoji: "📅",
    description: "Studied 3 days in a row",
  },
  STREAK_7: {
    id: "STREAK_7",
    title: "Week Warrior",
    emoji: "🗓️",
    description: "Studied 7 days in a row",
  },
  CARDS_10: {
    id: "CARDS_10",
    title: "Card Explorer",
    emoji: "🃏",
    description: "Reviewed 10 flashcards",
  },
  CARDS_50: {
    id: "CARDS_50",
    title: "Card Collector",
    emoji: "📚",
    description: "Reviewed 50 flashcards",
  },
}

export function useAchievements() {
  const getUnlocked = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("achievements") || "[]")
    } catch {
      return []
    }
  }, [])

  const unlock = useCallback(
    (id) => {
      const unlocked = (() => {
        try {
          return JSON.parse(localStorage.getItem("achievements") || "[]")
        } catch {
          return []
        }
      })()
      if (unlocked.includes(id)) return null
      localStorage.setItem("achievements", JSON.stringify([...unlocked, id]))
      return ACHIEVEMENTS[id] || null
    },
    []
  )

  const checkAndUnlock = useCallback(
    ({ quizzesTaken, percentage, streak, cardsReviewed }) => {
      const newAchievements = []

      const tryUnlock = (id) => {
        const a = unlock(id)
        if (a) newAchievements.push(a)
      }

      if (quizzesTaken >= 1) tryUnlock("FIRST_QUIZ")
      if (quizzesTaken >= 5) tryUnlock("QUIZ_5")
      if (quizzesTaken >= 10) tryUnlock("QUIZ_10")
      if (percentage === 100) tryUnlock("PERFECT_SCORE")
      if (streak >= 3) tryUnlock("STREAK_3")
      if (streak >= 7) tryUnlock("STREAK_7")
      if (cardsReviewed >= 10) tryUnlock("CARDS_10")
      if (cardsReviewed >= 50) tryUnlock("CARDS_50")

      return newAchievements
    },
    [unlock]
  )

  return { getUnlocked, checkAndUnlock, ACHIEVEMENTS }
}
