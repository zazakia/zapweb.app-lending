'use client'

import React, { memo, useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  LogOut, 
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TopNavigationLayoutProps {
  children: React.ReactNode
}

const TopNavigationLayout = memo(({ children }: TopNavigationLayoutProps) => {
  const { user, logout } = useAuth()
  const { settings, updateSettings } = useSettings()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Memoize time display
  const timeDisplay = useMemo(() => ({
    date: formatDate(currentTime),
    time: currentTime.toLocaleTimeString()
  }), [currentTime])

  const handleLayoutSwitch = () => {
    updateSettings({ navigationPosition: 'left' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  MELANN LENDING INVESTOR CORP.
                </h1>
                <p className="text-lg text-cyan-200 font-semibold tracking-wide">
                  DAILY COLLECTION AND LOAN REPORT
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-cyan-100 font-medium">Today is: {timeDisplay.date}</p>
                <p className="text-sm text-cyan-100 font-medium">
                  Time: {timeDisplay.time}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-cyan-200">Welcome</p>
                  <p className="font-semibold text-white">{user?.fullName}</p>
                  <p className="text-xs text-cyan-300">{user?.userLevel}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
                >
                  <SettingsIcon className="h-4 w-4 mr-1" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Layout Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Navigation:</label>
                <Button
                  variant={settings.navigationPosition === 'top' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ navigationPosition: 'top' })}
                >
                  Top Menu
                </Button>
                <Button
                  variant={settings.navigationPosition === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLayoutSwitch}
                >
                  <Menu className="h-4 w-4 mr-1" />
                  Left Sidebar
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Compact Mode:</label>
                <Button
                  variant={settings.compactMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ compactMode: !settings.compactMode })}
                >
                  {settings.compactMode ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${settings.compactMode ? 'py-4' : 'py-8'}`}>
        {children}
      </main>
    </div>
  )
})

TopNavigationLayout.displayName = 'TopNavigationLayout'

export default TopNavigationLayout