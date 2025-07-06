'use client'

import React, { memo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  LogOut, 
  Settings as SettingsIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  BarChart3,
  Target,
  Award,
  UserCheck,
  Home
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import OptimizedSidebarNavigation from '@/components/OptimizedSidebarNavigation'

interface SidebarNavigationLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/', shortcut: 'Ctrl+D' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/customers', shortcut: 'Ctrl+C' },
  { id: 'loans', label: 'Loans', icon: CreditCard, path: '/loans', shortcut: 'Ctrl+L' },
  { id: 'payments', label: 'Payments', icon: DollarSign, path: '/payments', shortcut: 'Ctrl+P' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', shortcut: 'Ctrl+R' },
  { id: 'admin', label: 'Admin', icon: BarChart3, path: '/admin/loan-types', shortcut: 'Ctrl+A' },
]

const SidebarNavigationLayout = memo(({ children }: SidebarNavigationLayoutProps) => {
  const { user, logout } = useAuth()
  const { settings, updateSettings } = useSettings()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Navigation handled by OptimizedSidebarNavigation component

  const toggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })
  }

  // Layout switching removed - sidebar is now permanent

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${settings.sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-indigo-900 via-purple-800 to-blue-900 shadow-xl transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!settings.sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">MELANN LENDING</h1>
                  <p className="text-xs text-cyan-200">INVESTOR CORP.</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white hover:bg-white/10 p-2"
            >
              {settings.sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          <OptimizedSidebarNavigation 
            items={navigationItems}
            collapsed={settings.sidebarCollapsed}
          />
        </div>

        {/* User Info & Settings */}
        <div className="p-4 border-t border-white/10">
          {!settings.sidebarCollapsed && (
            <div className="mb-4">
              <div className="text-xs text-cyan-200 mb-1">Welcome</div>
              <div className="font-semibold text-white text-sm">{user?.fullName}</div>
              <div className="text-xs text-cyan-300">{user?.userLevel}</div>
            </div>
          )}
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={`w-full text-white hover:bg-white/10 ${
                settings.sidebarCollapsed ? 'justify-center px-2' : 'justify-start px-4'
              }`}
            >
              <SettingsIcon className={`h-4 w-4 ${settings.sidebarCollapsed ? '' : 'mr-2'}`} />
              {!settings.sidebarCollapsed && 'Settings'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={`w-full text-white hover:bg-red-500/20 ${
                settings.sidebarCollapsed ? 'justify-center px-2' : 'justify-start px-4'
              }`}
            >
              <LogOut className={`h-4 w-4 ${settings.sidebarCollapsed ? '' : 'mr-2'}`} />
              {!settings.sidebarCollapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                DAILY COLLECTION AND LOAN REPORT
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 font-medium">Today: {formatDate(currentTime)}</p>
                <p className="text-sm text-gray-600 font-medium">
                  Time: {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white border-b border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Layout Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sidebar:</label>
                <Button
                  variant={settings.sidebarCollapsed ? 'outline' : 'default'}
                  size="sm"
                  onClick={toggleSidebar}
                >
                  {settings.sidebarCollapsed ? 'Expand' : 'Collapse'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ${
          settings.compactMode ? 'p-4' : 'p-8'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
})

SidebarNavigationLayout.displayName = 'SidebarNavigationLayout'

export default SidebarNavigationLayout