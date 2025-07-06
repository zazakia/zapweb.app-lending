import { useEffect, useCallback } from 'react'
import { NavigationOptimizer } from '@/lib/navigationOptimizer'

// Performance optimization hook
export function usePerformanceOptimizations() {
  useEffect(() => {
    // Preload critical routes
    const criticalRoutes = [
      '/customers',
      '/loans', 
      '/payments',
      '/reports',
      '/settings'
    ]

    // Preload routes with a slight delay to not block initial render
    const preloadTimer = setTimeout(() => {
      criticalRoutes.forEach(route => {
        NavigationOptimizer.preloadRoute(route)
      })
    }, 1000)

    return () => clearTimeout(preloadTimer)
  }, [])

  // Optimize keyboard navigation
  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const navigate = (path: string) => {
          event.preventDefault()
          // Use Next.js router for instant navigation
          window.history.pushState(null, '', path)
          window.dispatchEvent(new PopStateEvent('popstate'))
        }

        switch (event.key.toLowerCase()) {
          case 'd':
            navigate('/')
            break
          case 'c':
            navigate('/customers')
            break
          case 'l':
            navigate('/loans')
            break
          case 'p':
            navigate('/payments')
            break
          case 'r':
            navigate('/reports')
            break
          case 'a':
            navigate('/admin/loan-types')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [])

  // Optimize network requests
  const optimizeNetworkRequests = useCallback(() => {
    // Enable browser optimizations
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      // Adjust behavior based on connection speed
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Disable preloading on slow connections
        return false
      }
    }
    return true
  }, [])

  // Optimize rendering performance
  useEffect(() => {
    // Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        // Perform non-critical optimizations during idle time
        
        // Optimize images
        const images = document.querySelectorAll('img[data-src]')
        images.forEach(img => {
          const imageElement = img as HTMLImageElement
          if (imageElement.dataset.src) {
            imageElement.src = imageElement.dataset.src
            imageElement.removeAttribute('data-src')
          }
        })

        // Clean up unused event listeners
        // This would be implemented based on specific needs
      })

      return () => window.cancelIdleCallback(idleCallback)
    }
  }, [])

  return {
    optimizeNetworkRequests
  }
}

// Web Vitals optimization
export function useWebVitalsOptimizations() {
  useEffect(() => {
    // Optimize Largest Contentful Paint (LCP)
    const optimizeLCP = () => {
      // Preload critical resources
      const criticalResources = [
        '/fonts/inter-var.woff2',
        // Add other critical resources
      ]

      criticalResources.forEach(resource => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource
        link.as = resource.includes('.woff') ? 'font' : 'image'
        if (resource.includes('.woff')) {
          link.crossOrigin = 'anonymous'
        }
        document.head.appendChild(link)
      })
    }

    // Optimize First Input Delay (FID)
    const optimizeFID = () => {
      // Break up long tasks
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        // Use the Scheduler API for better task scheduling
        const scheduler = (window as any).scheduler
        
        // Schedule non-critical work
        scheduler.postTask(() => {
          // Non-critical initialization
        }, { priority: 'background' })
      }
    }

    // Optimize Cumulative Layout Shift (CLS)
    const optimizeCLS = () => {
      // Reserve space for dynamic content
      const dynamicElements = document.querySelectorAll('[data-dynamic]')
      dynamicElements.forEach(element => {
        const htmlElement = element as HTMLElement
        if (!htmlElement.style.minHeight) {
          htmlElement.style.minHeight = '100px' // Reserve space
        }
      })
    }

    optimizeLCP()
    optimizeFID()
    optimizeCLS()
  }, [])
}

// Memory optimization
export function useMemoryOptimizations() {
  useEffect(() => {
    // Clean up memory leaks
    const cleanup = () => {
      // Clear any cached data that's no longer needed
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          const oldCaches = cacheNames.filter(name => 
            name.includes('old') || name.includes('expired')
          )
          
          oldCaches.forEach(cacheName => {
            caches.delete(cacheName)
          })
        })
      }
    }

    // Run cleanup periodically
    const cleanupInterval = setInterval(cleanup, 5 * 60 * 1000) // Every 5 minutes

    return () => {
      clearInterval(cleanupInterval)
      cleanup()
    }
  }, [])
}