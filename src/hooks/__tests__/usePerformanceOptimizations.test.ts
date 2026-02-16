import { renderHook, act } from '@testing-library/react'
import { usePerformanceOptimizations, useWebVitalsOptimizations, useMemoryOptimizations } from '../usePerformanceOptimizations'
import { NavigationOptimizer } from '../../lib/navigationOptimizer'

// Mock NavigationOptimizer
jest.mock('../../lib/navigationOptimizer', () => ({
    NavigationOptimizer: {
        preloadRoute: jest.fn(),
    },
}))

describe('usePerformanceOptimizations', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        // Mock navigator.connection
        Object.defineProperty(navigator, 'connection', {
            value: { effectiveType: '4g' },
            configurable: true,
            writable: true,
        })

        // Mock window.requestIdleCallback and window.cancelIdleCallback
        Object.defineProperty(window, 'requestIdleCallback', {
            value: jest.fn().mockImplementation(cb => cb()),
            configurable: true,
            writable: true,
        })
        Object.defineProperty(window, 'cancelIdleCallback', {
            value: jest.fn(),
            configurable: true,
            writable: true,
        })

        // Mock window.caches
        Object.defineProperty(window, 'caches', {
            value: {
                keys: jest.fn().mockResolvedValue([]),
                delete: jest.fn().mockResolvedValue(true),
            },
            configurable: true,
            writable: true,
        })

        // Also mock global caches if needed
        global.caches = (window as any).caches
    })

    afterEach(() => {
        jest.useRealTimers()
        delete (global as any).caches
    })

    it('preloads critical routes after a delay', async () => {
        renderHook(() => usePerformanceOptimizations())

        expect(NavigationOptimizer.preloadRoute).not.toHaveBeenCalled()

        // Advance time by 1000ms
        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(NavigationOptimizer.preloadRoute).toHaveBeenCalled()
        expect(NavigationOptimizer.preloadRoute).toHaveBeenCalledWith('/customers')
    })

    it('handles keyboard shortcuts', () => {
        renderHook(() => usePerformanceOptimizations())
        const pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => { })
        const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true)

        // Simulate Ctrl+D
        const event = new KeyboardEvent('keydown', {
            key: 'd',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        })

        act(() => {
            document.dispatchEvent(event)
        })

        expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/')
        expect(dispatchSpy).toHaveBeenCalled()

        pushStateSpy.mockRestore()
        dispatchSpy.mockRestore()
    })

    it('disables preloading on slow connections', () => {
        Object.defineProperty(navigator, 'connection', {
            value: { effectiveType: '2g' },
            configurable: true,
        })

        const { result } = renderHook(() => usePerformanceOptimizations())

        const shouldOptimize = result.current.optimizeNetworkRequests()
        expect(shouldOptimize).toBe(false)
    })

    it('performs idle optimizations', () => {
        const idleSpy = window.requestIdleCallback as jest.Mock
        renderHook(() => usePerformanceOptimizations())

        expect(idleSpy).toHaveBeenCalled()
    })

    describe('useWebVitalsOptimizations', () => {
        it('appends preload links to head', () => {
            renderHook(() => useWebVitalsOptimizations())
            const links = document.head.querySelectorAll('link[rel="preload"]')
            expect(links.length).toBeGreaterThan(0)
        })
    })

    describe('useMemoryOptimizations', () => {
        it('clears caches on cleanup', async () => {
            const keysSpy = jest.spyOn(window.caches, 'keys').mockResolvedValue(['old-cache'])
            const deleteSpy = jest.spyOn(window.caches, 'delete').mockResolvedValue(true)

            const { unmount } = renderHook(() => useMemoryOptimizations())

            await act(async () => {
                unmount()
            })

            expect(keysSpy).toHaveBeenCalled()
            expect(deleteSpy).toHaveBeenCalledWith('old-cache')
        })
    })
})
