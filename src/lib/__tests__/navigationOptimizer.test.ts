import { NavigationOptimizer } from '../navigationOptimizer'

// Mock Next.js router
const mockPrefetch = jest.fn()
jest.mock('next/router', () => ({
  default: {
    prefetch: mockPrefetch,
  },
}))

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    rel: '',
    href: '',
    appendChild: jest.fn(),
  })),
  writable: true,
})

Object.defineProperty(document, 'head', {
  value: {
    appendChild: jest.fn(),
  },
  writable: true,
})

describe('NavigationOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear static state
    NavigationOptimizer['preloadedRoutes'].clear()
    NavigationOptimizer['prefetchedData'].clear()
  })

  describe('Route Preloading', () => {
    it('preloads a route only once', () => {
      const path = '/customers'
      
      NavigationOptimizer.preloadRoute(path)
      NavigationOptimizer.preloadRoute(path) // Second call should be ignored
      
      expect(NavigationOptimizer['preloadedRoutes'].has(path)).toBe(true)
      expect(NavigationOptimizer['preloadedRoutes'].size).toBe(1)
    })

    it('preloads multiple different routes', () => {
      const paths = ['/customers', '/loans', '/payments']
      
      paths.forEach(path => NavigationOptimizer.preloadRoute(path))
      
      expect(NavigationOptimizer['preloadedRoutes'].size).toBe(3)
      paths.forEach(path => {
        expect(NavigationOptimizer['preloadedRoutes'].has(path)).toBe(true)
      })
    })

    it('creates prefetch link elements', () => {
      const mockLink = {
        rel: '',
        href: '',
      }
      const mockAppendChild = jest.fn()
      
      ;(document.createElement as jest.Mock).mockReturnValue(mockLink)
      ;(document.head.appendChild as jest.Mock).mockImplementation(mockAppendChild)
      
      NavigationOptimizer.preloadRoute('/customers')
      
      expect(document.createElement).toHaveBeenCalledWith('link')
      expect(mockLink.rel).toBe('prefetch')
      expect(mockLink.href).toBe('/customers')
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink)
    })
  })

  describe('Data Prefetching', () => {
    it('prefetches data and caches it', async () => {
      const path = '/customers'
      const mockData = { customers: [{ id: 1, name: 'John' }] }
      const mockFetcher = jest.fn().mockResolvedValue(mockData)
      
      const result = await NavigationOptimizer.prefetchData(path, mockFetcher)
      
      expect(mockFetcher).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockData)
      expect(NavigationOptimizer.getPrefetchedData(path)).toEqual(mockData)
    })

    it('returns cached data on subsequent calls', async () => {
      const path = '/customers'
      const mockData = { customers: [{ id: 1, name: 'John' }] }
      const mockFetcher = jest.fn().mockResolvedValue(mockData)
      
      // First call
      await NavigationOptimizer.prefetchData(path, mockFetcher)
      
      // Second call should return cached data
      const result = await NavigationOptimizer.prefetchData(path, mockFetcher)
      
      expect(mockFetcher).toHaveBeenCalledTimes(1) // Only called once
      expect(result).toEqual(mockData)
    })

    it('handles fetcher errors gracefully', async () => {
      const path = '/customers'
      const mockError = new Error('Network error')
      const mockFetcher = jest.fn().mockRejectedValue(mockError)
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const result = await NavigationOptimizer.prefetchData(path, mockFetcher)
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to prefetch data'),
        mockError
      )
      
      consoleSpy.mockRestore()
    })

    it('gets prefetched data correctly', () => {
      const path = '/customers'
      const mockData = { customers: [] }
      
      // Manually set cached data
      NavigationOptimizer['prefetchedData'].set(path, mockData)
      
      const result = NavigationOptimizer.getPrefetchedData(path)
      expect(result).toEqual(mockData)
    })

    it('returns undefined for non-cached data', () => {
      const result = NavigationOptimizer.getPrefetchedData('/non-existent')
      expect(result).toBeUndefined()
    })

    it('clears specific prefetched data', () => {
      const path1 = '/customers'
      const path2 = '/loans'
      
      NavigationOptimizer['prefetchedData'].set(path1, { data: 'test1' })
      NavigationOptimizer['prefetchedData'].set(path2, { data: 'test2' })
      
      NavigationOptimizer.clearPrefetchedData(path1)
      
      expect(NavigationOptimizer.getPrefetchedData(path1)).toBeUndefined()
      expect(NavigationOptimizer.getPrefetchedData(path2)).toBeDefined()
    })

    it('clears all prefetched data', () => {
      NavigationOptimizer['prefetchedData'].set('/customers', { data: 'test1' })
      NavigationOptimizer['prefetchedData'].set('/loans', { data: 'test2' })
      
      NavigationOptimizer.clearPrefetchedData()
      
      expect(NavigationOptimizer['prefetchedData'].size).toBe(0)
    })
  })

  describe('Static State Management', () => {
    it('maintains preloaded routes across instances', () => {
      NavigationOptimizer.preloadRoute('/customers')
      
      // Check that the static state persists
      expect(NavigationOptimizer['preloadedRoutes'].has('/customers')).toBe(true)
    })

    it('maintains prefetched data across instances', async () => {
      const path = '/customers'
      const mockData = { test: 'data' }
      const mockFetcher = jest.fn().mockResolvedValue(mockData)
      
      await NavigationOptimizer.prefetchData(path, mockFetcher)
      
      // Check that the static state persists
      expect(NavigationOptimizer.getPrefetchedData(path)).toEqual(mockData)
    })
  })

  describe('Browser Environment', () => {
    it('handles missing window object gracefully', () => {
      const originalWindow = global.window
      
      // @ts-ignore
      delete global.window
      
      // Should not throw an error
      expect(() => NavigationOptimizer.preloadRoute('/test')).not.toThrow()
      
      global.window = originalWindow
    })

    it('works in browser environment', () => {
      Object.defineProperty(global, 'window', {
        value: {
          location: { href: 'https://example.com' },
        },
        writable: true,
      })
      
      expect(() => NavigationOptimizer.preloadRoute('/test')).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('handles document.createElement errors gracefully', () => {
      const originalCreateElement = document.createElement
      
      ;(document.createElement as jest.Mock).mockImplementation(() => {
        throw new Error('DOM error')
      })
      
      // Should not throw
      expect(() => NavigationOptimizer.preloadRoute('/test')).not.toThrow()
      
      document.createElement = originalCreateElement
    })

    it('handles appendChild errors gracefully', () => {
      const mockLink = { rel: '', href: '' }
      ;(document.createElement as jest.Mock).mockReturnValue(mockLink)
      ;(document.head.appendChild as jest.Mock).mockImplementation(() => {
        throw new Error('Append error')
      })
      
      // Should not throw
      expect(() => NavigationOptimizer.preloadRoute('/test')).not.toThrow()
    })
  })
})