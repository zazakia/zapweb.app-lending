import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

// Navigation performance optimizer
export class NavigationOptimizer {
  private static preloadedRoutes = new Set<string>()
  private static prefetchedData = new Map<string, any>()

  // Preload route components
  static preloadRoute(path: string) {
    if (this.preloadedRoutes.has(path)) return

    this.preloadedRoutes.add(path)

    // Use Next.js router prefetch
    if (typeof window !== 'undefined') {
      import('next/router').then(({ default: router }) => {
        router.prefetch(path)
      }).catch(() => {
        try {
          // Fallback for app router
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = path
          document.head.appendChild(link)
        } catch (err) {
          console.warn('Failed to create prefetch link:', err)
        }
      })
    }
  }

  // Prefetch page data
  static async prefetchData(path: string, dataFetcher: () => Promise<any>) {
    if (this.prefetchedData.has(path)) return this.prefetchedData.get(path)

    try {
      const data = await dataFetcher()
      this.prefetchedData.set(path, data)
      return data
    } catch (error) {
      console.warn(`Failed to prefetch data for ${path}:`, error)
      return null
    }
  }

  // Get prefetched data
  static getPrefetchedData(path: string) {
    return this.prefetchedData.get(path)
  }

  // Clear prefetched data
  static clearPrefetchedData(path?: string) {
    if (path) {
      this.prefetchedData.delete(path)
    } else {
      this.prefetchedData.clear()
    }
  }
}

// Hook for optimized navigation
export function useOptimizedNavigation() {
  const router = useRouter()

  // Fast navigation with loading state
  const navigateWithLoading = useCallback((path: string, showLoading = true) => {
    // Show immediate loading state
    if (showLoading) {
      document.body.style.cursor = 'wait'

      // Add loading class to body
      document.body.classList.add('page-transitioning')
    }

    // Use startTransition for smoother UI updates
    if ('startTransition' in React) {
      React.startTransition(() => {
        router.push(path)
      })
    } else {
      router.push(path)
    }

    // Clean up loading state after navigation
    setTimeout(() => {
      document.body.style.cursor = 'default'
      document.body.classList.remove('page-transitioning')
    }, 150)
  }, [router])

  // Preload on hover
  const handleMouseEnter = useCallback((path: string) => {
    NavigationOptimizer.preloadRoute(path)
  }, [])

  return {
    navigate: navigateWithLoading,
    preloadOnHover: handleMouseEnter
  }
}

// React import fix
const React = require('react')