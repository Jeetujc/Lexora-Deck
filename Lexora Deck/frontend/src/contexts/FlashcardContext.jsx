import React, { createContext, useContext, useState } from 'react'

const FlashcardContext = createContext()

export const useFlashcard = () => {
  const context = useContext(FlashcardContext)
  if (!context) {
    throw new Error('useFlashcard must be used within a FlashcardProvider')
  }
  return context
}

export const FlashcardProvider = ({ children }) => {
  const [selectedFlashcard, setSelectedFlashcard] = useState(null)

  const value = {
    selectedFlashcard,
    setSelectedFlashcard,
  }

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  )
}