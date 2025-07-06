import { useState, useEffect, useCallback, useMemo } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

const dataCache = new DataCache()

interface UsePerformanceOptimizedDataOptions<T> {
  key: string
  fetcher: () => Promise<T>
  ttl?: number
  refreshInterval?: number
  enabled?: boolean
}

export function usePerformanceOptimizedData<T>({
  key,
  fetcher,
  ttl = 5 * 60 * 1000, // 5 minutes default
  refreshInterval,
  enabled = true
}: UsePerformanceOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const fetchData = useCallback(async (force: boolean = false) => {
    if (!enabled) return

    try {
      // Check cache first unless forced
      if (!force && dataCache.has(key)) {
        const cachedData = dataCache.get<T>(key)
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return cachedData
        }
      }

      setLoading(true)
      setError(null)
      
      const result = await fetcher()
      
      // Cache the result
      dataCache.set(key, result, ttl)
      
      setData(result)
      setLastFetch(Date.now())
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`Error fetching data for key ${key}:`, err)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl, enabled])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh interval
  useEffect(() => {
    if (!refreshInterval || !enabled) return

    const interval = setInterval(() => {
      fetchData(true) // Force refresh
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchData, refreshInterval, enabled])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const isStale = useMemo(() => {
    if (!lastFetch) return false
    return Date.now() - lastFetch > ttl
  }, [lastFetch, ttl])

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
    lastFetch
  }
}

// Hook specifically for dashboard data
export function useDashboardData() {
  const { customerService } = require('@/lib/services/customerService')
  const { loanService } = require('@/lib/services/loanService')
  const { paymentService } = require('@/lib/services/paymentService')

  return usePerformanceOptimizedData({
    key: 'dashboard-data',
    fetcher: async () => {
      const [customers, loansSummary, paymentsSummary] = await Promise.all([
        customerService.getCustomers(),
        loanService.getLoansSummary(),
        paymentService.getPaymentSummary()
      ])

      const rateOfReturn = loansSummary.totalPrincipal > 0 
        ? (paymentsSummary.totalAmount / loansSummary.totalPrincipal) * 100 
        : 0

      return {
        totalClients: customers.length,
        totalLoans: loansSummary.totalLoans,
        totalPrincipal: loansSummary.totalPrincipal,
        totalPayments: paymentsSummary.totalAmount,
        rateOfReturn,
        activeLoans: loansSummary.activeLoans,
        pastDueLoans: loansSummary.pastDueLoans
      }
    },
    ttl: 2 * 60 * 1000, // 2 minutes for dashboard data
    refreshInterval: 30 * 1000 // Auto-refresh every 30 seconds
  })
}

// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}