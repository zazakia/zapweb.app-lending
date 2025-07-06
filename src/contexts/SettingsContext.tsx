'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface LayoutSettings {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  sidebarCollapsed: boolean
}

interface SettingsContextType {
  settings: LayoutSettings
  updateSettings: (newSettings: Partial<LayoutSettings>) => void
  resetSettings: () => void
}

const defaultSettings: LayoutSettings = {
  theme: 'light',
  compactMode: false,
  sidebarCollapsed: false
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<LayoutSettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('melann-app-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Error parsing saved settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('melann-app-settings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<LayoutSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('melann-app-settings')
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}