'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dashboard' | 'sidebar'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dashboard')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('melann-theme') as Theme
    if (savedTheme && (savedTheme === 'dashboard' || savedTheme === 'sidebar')) {
      setTheme(savedTheme)
    }
  }, [])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('melann-theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dashboard' ? 'sidebar' : 'dashboard'
    handleSetTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}