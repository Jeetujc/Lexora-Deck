import { useCallback } from "react"

export function useQuizStats() {
  const getHistory = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("quizHistory") || "[]")
    } catch {
      return []
    }
  }, [])

  const saveQuiz = useCallback(
    ({ topic, score, total, difficulty }) => {
      const history = (() => {
        try {
          return JSON.parse(localStorage.getItem("quizHistory") || "[]")
        } catch {
          return []
        }
      })()

      const percentage = total > 0 ? Math.round((score / total) * 100) : 0
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        topic,
        score,
        total,
        percentage,
        difficulty: difficulty || "medium",
      }

      const updated = [entry, ...history].slice(0, 10)
      localStorage.setItem("quizHistory", JSON.stringify(updated))

      // Update total points (10 pts per correct answer, bonus for difficulty)
      const diffBonus = { easy: 1, medium: 1.5, hard: 2 }[difficulty || "medium"] || 1
      const earned = Math.round(score * 10 * diffBonus)
      const prevPoints = parseInt(localStorage.getItem("totalPoints") || "0")
      localStorage.setItem("totalPoints", String(prevPoints + earned))

      return entry
    },
    []
  )

  const getStats = useCallback(() => {
    const history = (() => {
      try {
        return JSON.parse(localStorage.getItem("quizHistory") || "[]")
      } catch {
        return []
      }
    })()
    const cardsReviewed = parseInt(localStorage.getItem("cardsReviewed") || "0")
    const totalPoints = parseInt(localStorage.getItem("totalPoints") || "0")
    const currentStreak = parseInt(localStorage.getItem("currentStreak") || "0")
    const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.percentage)) : 0

    return {
      quizzesTaken: history.length,
      cardsReviewed,
      totalPoints,
      currentStreak,
      bestScore,
      history,
    }
  }, [])

  return { saveQuiz, getStats, getHistory }
}
