"use client"

import { createContext, useContext, useState, useEffect } from "react"

const FlashcardProgressContext = createContext()

export const useFlashcardProgress = () => {
  const context = useContext(FlashcardProgressContext)
  if (!context) {
    throw new Error('useFlashcardProgress must be used within a FlashcardProgressProvider')
  }
  return context
}

export const FlashcardProgressProvider = ({ children }) => {
  const [viewedCategories, setViewedCategories] = useState([])
  const [studyProgress, setStudyProgress] = useState({})

  // Load viewed categories from localStorage on initialization
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lexora-viewed-categories')
      if (saved) {
        setViewedCategories(JSON.parse(saved))
      }
      
      const savedProgress = localStorage.getItem('lexora-study-progress')
      if (savedProgress) {
        setStudyProgress(JSON.parse(savedProgress))
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error)
    }
  }, [])

  // Save to localStorage whenever viewed categories change
  useEffect(() => {
    try {
      localStorage.setItem('lexora-viewed-categories', JSON.stringify(viewedCategories))
    } catch (error) {
      console.error('Error saving viewed categories:', error)
    }
  }, [viewedCategories])

  // Save study progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lexora-study-progress', JSON.stringify(studyProgress))
    } catch (error) {
      console.error('Error saving study progress:', error)
    }
  }, [studyProgress])

  const addViewedCategory = (category, cardTitle) => {
    if (!category || !cardTitle) return
    
    setViewedCategories(prev => {
      const newCategory = { category, cardTitle, viewedAt: new Date().toISOString() }
      const exists = prev.some(item => item.category === category && item.cardTitle === cardTitle)
      if (exists) return prev
      return [...prev, newCategory]
    })

    // Update study progress
    setStudyProgress(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        cardsStudied: (prev[category]?.cardsStudied || 0) + 1,
        lastStudied: new Date().toISOString()
      }
    }))
  }

  const getUniqueCategories = () => {
    return [...new Set(viewedCategories.map(item => item.category))]
  }

  const getCategoryProgress = (category) => {
    return studyProgress[category] || { cardsStudied: 0, lastStudied: null }
  }

  const value = {
    viewedCategories,
    studyProgress,
    addViewedCategory,
    getUniqueCategories,
    getCategoryProgress
  }

  return (
    <FlashcardProgressContext.Provider value={value}>
      {children}
    </FlashcardProgressContext.Provider>
  )
}