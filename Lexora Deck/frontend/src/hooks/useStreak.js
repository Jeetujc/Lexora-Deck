import { useCallback } from "react"

export function useStreak() {
  const getStreak = useCallback(() => {
    try {
      const streak = parseInt(localStorage.getItem("currentStreak") || "0")
      const lastDateStr = localStorage.getItem("lastStudyDate")
      if (!lastDateStr) return 0

      const last = new Date(lastDateStr)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      const isTodayOrYesterday =
        last.toDateString() === today.toDateString() ||
        last.toDateString() === yesterday.toDateString()

      return isTodayOrYesterday ? streak : 0
    } catch {
      return 0
    }
  }, [])

  const updateStreak = useCallback(() => {
    const today = new Date()
    const todayStr = today.toDateString()
    const lastDateStr = localStorage.getItem("lastStudyDate")

    if (lastDateStr) {
      const last = new Date(lastDateStr)
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      if (last.toDateString() === todayStr) {
        // Already updated today
        return parseInt(localStorage.getItem("currentStreak") || "1")
      }

      if (last.toDateString() === yesterday.toDateString()) {
        // Continue streak
        const streak = parseInt(localStorage.getItem("currentStreak") || "0") + 1
        localStorage.setItem("currentStreak", String(streak))
        localStorage.setItem("lastStudyDate", today.toISOString())
        return streak
      }

      // Streak broken – reset to 1
      localStorage.setItem("currentStreak", "1")
    } else {
      localStorage.setItem("currentStreak", "1")
    }

    localStorage.setItem("lastStudyDate", today.toISOString())
    return 1
  }, [])

  return { getStreak, updateStreak }
}
