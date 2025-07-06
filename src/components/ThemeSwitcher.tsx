'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { Monitor, Sidebar } from 'lucide-react'

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg'
}

export default function ThemeSwitcher({ className = '', showLabel = true, size = 'default' }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className={`flex items-center gap-2 ${className}`}
      title={`Switch to ${theme === 'dashboard' ? 'Sidebar' : 'Dashboard'} Theme`}
    >
      {theme === 'dashboard' ? (
        <Sidebar className="h-4 w-4" />
      ) : (
        <Monitor className="h-4 w-4" />
      )}
      {showLabel && (
        <span>
          {theme === 'dashboard' ? 'Sidebar' : 'Dashboard'} Theme
        </span>
      )}
    </Button>
  )
}