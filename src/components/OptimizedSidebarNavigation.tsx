'use client'

import React, { memo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useOptimizedNavigation, NavigationOptimizer } from '@/lib/navigationOptimizer'
import { LucideIcon } from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
  shortcut: string
}

interface OptimizedSidebarNavigationProps {
  items: NavigationItem[]
  collapsed: boolean
  className?: string
}

const OptimizedSidebarNavigation = memo(({
  items,
  collapsed,
  className = ''
}: OptimizedSidebarNavigationProps) => {
  const { navigate, preloadOnHover } = useOptimizedNavigation()
  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  const handleNavigation = useCallback((item: NavigationItem) => {
    setLoadingItem(item.id)
    navigate(item.path)
    
    // Reset loading state
    setTimeout(() => setLoadingItem(null), 200)
  }, [navigate])

  const handleMouseEnter = useCallback((path: string) => {
    preloadOnHover(path)
  }, [preloadOnHover])

  return (
    <nav className={`space-y-1 px-2 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon
        const isLoading = loadingItem === item.id
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`
              w-full justify-start text-white hover:bg-white/10 hover:text-white 
              transition-all duration-150 group relative
              ${collapsed ? 'px-2' : 'px-4'}
              ${isLoading ? 'opacity-75' : 'hover:scale-105 active:scale-95'}
            `}
            onClick={() => handleNavigation(item)}
            onMouseEnter={() => handleMouseEnter(item.path)}
            onTouchStart={() => NavigationOptimizer.preloadRoute(item.path)}
            disabled={isLoading}
          >
            <Icon 
              className={`
                h-5 w-5 transition-transform duration-150
                ${collapsed ? '' : 'mr-3'}
                ${isLoading ? 'animate-pulse' : 'group-hover:scale-110'}
              `} 
            />
            {!collapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-cyan-300">{item.shortcut}</div>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-10 rounded">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </Button>
        )
      })}
    </nav>
  )
})

OptimizedSidebarNavigation.displayName = 'OptimizedSidebarNavigation'

export default OptimizedSidebarNavigation