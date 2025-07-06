'use client'

import React, { memo, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useOptimizedNavigation, NavigationOptimizer } from '@/lib/navigationOptimizer'
import { LucideIcon } from 'lucide-react'

interface OptimizedNavigationButtonProps {
  path: string
  icon: LucideIcon
  label: string
  shortcut?: string
  colorScheme: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
}

const OptimizedNavigationButton = memo(({
  path,
  icon: Icon,
  label,
  shortcut,
  colorScheme,
  className = '',
  variant = 'outline',
  size = 'default',
  disabled = false
}: OptimizedNavigationButtonProps) => {
  const { navigate, preloadOnHover } = useOptimizedNavigation()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (disabled || isLoading) return

    setIsLoading(true)
    navigate(path)
    
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 200)
  }, [path, navigate, disabled, isLoading])

  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      preloadOnHover(path)
    }
  }, [path, preloadOnHover, disabled])

  const handleTouchStart = useCallback(() => {
    // Preload on touch for mobile devices
    if (!disabled) {
      NavigationOptimizer.preloadRoute(path)
    }
  }, [path, disabled])

  const buttonClassName = `
    h-20 flex flex-col gap-2 
    bg-gradient-to-br from-${colorScheme}-50 to-${colorScheme}-100 
    hover:from-${colorScheme}-100 hover:to-${colorScheme}-200 
    border-${colorScheme}-200 
    transition-all duration-150 
    group
    ${isLoading ? 'opacity-75 cursor-wait' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
    ${className}
  `.trim()

  return (
    <Button 
      className={buttonClassName}
      variant={variant}
      size={size}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      disabled={disabled || isLoading}
      aria-label={`Navigate to ${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <Icon 
        className={`
          h-6 w-6 text-${colorScheme}-600 
          transition-transform duration-150
          ${isLoading ? 'animate-pulse' : 'group-hover:scale-110 group-active:scale-90'}
        `} 
      />
      <span className={`text-xs font-medium text-${colorScheme}-700 transition-colors duration-150`}>
        {label}
      </span>
      {shortcut && (
        <span className={`text-[10px] text-${colorScheme}-500 transition-colors duration-150`}>
          {shortcut}
        </span>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded">
          <div className={`w-4 h-4 border-2 border-${colorScheme}-600 border-t-transparent rounded-full animate-spin`} />
        </div>
      )}
    </Button>
  )
})

OptimizedNavigationButton.displayName = 'OptimizedNavigationButton'

export default OptimizedNavigationButton