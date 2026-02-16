import { renderHook, act } from '@testing-library/react'
import { usePerformanceOptimizedData, useDebounce } from '../usePerformanceOptimizedData'

describe('usePerformanceOptimizedData', () => {
    const mockFetcher = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('fetches data on mount', async () => {
        mockFetcher.mockResolvedValue('test-data')

        const { result } = renderHook(() =>
            usePerformanceOptimizedData({ key: 'test', fetcher: mockFetcher })
        )

        expect(result.current.loading).toBe(true)

        await act(async () => {
            await Promise.resolve() // Wait for fetchData
        })

        expect(result.current.data).toBe('test-data')
        expect(result.current.loading).toBe(false)
        expect(mockFetcher).toHaveBeenCalledTimes(1)
    })

    it('uses cached data if available', async () => {
        mockFetcher.mockResolvedValue('fresh-data')

        // First render to cache data
        const { unmount } = renderHook(() =>
            usePerformanceOptimizedData({ key: 'cache-test', fetcher: mockFetcher })
        )

        await act(async () => {
            await Promise.resolve()
        })

        unmount()

        // Second render with same key
        const { result } = renderHook(() =>
            usePerformanceOptimizedData({ key: 'cache-test', fetcher: mockFetcher })
        )

        // Should use cache immediately
        expect(result.current.data).toBe('fresh-data')
        expect(result.current.loading).toBe(false)
        expect(mockFetcher).toHaveBeenCalledTimes(1) // Not called again
    })

    it('refreshes data on interval', async () => {
        mockFetcher.mockResolvedValue('data')

        renderHook(() =>
            usePerformanceOptimizedData({
                key: 'refresh-test',
                fetcher: mockFetcher,
                refreshInterval: 1000
            })
        )

        await act(async () => {
            await Promise.resolve()
        })

        expect(mockFetcher).toHaveBeenCalledTimes(1)

        // Fast-forward time
        await act(async () => {
            jest.advanceTimersByTime(1000)
        })

        expect(mockFetcher).toHaveBeenCalledTimes(2)
    })

    it('handles errors gracefully', async () => {
        mockFetcher.mockRejectedValue(new Error('Fetch failed'))

        const { result } = renderHook(() =>
            usePerformanceOptimizedData({ key: 'error-test', fetcher: mockFetcher })
        )

        await act(async () => {
            await Promise.resolve()
        })

        expect(result.current.error).toBe('Fetch failed')
        expect(result.current.loading).toBe(false)
    })
})

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    it('debounces values correctly', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        )

        expect(result.current).toBe('initial')

        // Update value
        rerender({ value: 'updated', delay: 500 })
        expect(result.current).toBe('initial') // Still initial

        // Advance time
        act(() => {
            jest.advanceTimersByTime(500)
        })
        expect(result.current).toBe('updated')
    })
})
