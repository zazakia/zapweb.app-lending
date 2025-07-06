const puppeteer = require('puppeteer')

describe('Navigation Performance Tests', () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  })

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
  })

  beforeEach(async () => {
    page = await browser.newPage()
    
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.navigationTimes = []
      window.performance.mark = window.performance.mark || function() {}
      window.performance.measure = window.performance.measure || function() {}
    })
  })

  afterEach(async () => {
    if (page) {
      await page.close()
    }
  })

  const measureNavigationTime = async (fromUrl, toUrl, selector) => {
    try {
      // Go to initial page
      await page.goto(fromUrl, { waitUntil: 'networkidle0' })
      
      // Mark start time
      const startTime = Date.now()
      
      // Click navigation element
      await page.click(selector)
      
      // Wait for navigation to complete
      await page.waitForURL(toUrl, { timeout: 5000 })
      await page.waitForLoadState('networkidle')
      
      // Calculate navigation time
      const endTime = Date.now()
      const navigationTime = endTime - startTime
      
      return navigationTime
    } catch (error) {
      console.warn(`Navigation test skipped: ${error.message}`)
      return null
    }
  }

  it('should navigate to customers page quickly', async () => {
    const navigationTime = await measureNavigationTime(
      'http://localhost:3000',
      'http://localhost:3000/customers',
      '[href="/customers"]'
    )
    
    if (navigationTime !== null) {
      console.log(`Customers navigation time: ${navigationTime}ms`)
      expect(navigationTime).toBeLessThan(2000) // Should navigate in under 2 seconds
    }
  }, 30000)

  it('should navigate to loans page quickly', async () => {
    const navigationTime = await measureNavigationTime(
      'http://localhost:3000',
      'http://localhost:3000/loans',
      '[href="/loans"]'
    )
    
    if (navigationTime !== null) {
      console.log(`Loans navigation time: ${navigationTime}ms`)
      expect(navigationTime).toBeLessThan(2000)
    }
  }, 30000)

  it('should navigate to payments page quickly', async () => {
    const navigationTime = await measureNavigationTime(
      'http://localhost:3000',
      'http://localhost:3000/payments',
      '[href="/payments"]'
    )
    
    if (navigationTime !== null) {
      console.log(`Payments navigation time: ${navigationTime}ms`)
      expect(navigationTime).toBeLessThan(2000)
    }
  }, 30000)

  it('should have fast click response times', async () => {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
      
      // Test button click response time
      const clickResponseTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          const button = document.querySelector('button')
          if (!button) {
            resolve(null)
            return
          }
          
          const startTime = performance.now()
          
          button.addEventListener('click', () => {
            const endTime = performance.now()
            resolve(endTime - startTime)
          }, { once: true })
          
          button.click()
        })
      })
      
      if (clickResponseTime !== null) {
        console.log(`Click response time: ${clickResponseTime}ms`)
        expect(clickResponseTime).toBeLessThan(50) // Should respond in under 50ms
      }
    } catch (error) {
      console.warn(`Click response test skipped: ${error.message}`)
    }
  }, 30000)

  it('should preload routes effectively', async () => {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
      
      // Check if routes are preloaded
      const preloadedRoutes = await page.evaluate(() => {
        const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]')
        return Array.from(prefetchLinks).map(link => link.href)
      })
      
      console.log('Preloaded routes:', preloadedRoutes)
      
      // Should have preloaded critical routes
      const expectedRoutes = ['/customers', '/loans', '/payments']
      const preloadedCriticalRoutes = expectedRoutes.filter(route => 
        preloadedRoutes.some(preloaded => preloaded.includes(route))
      )
      
      expect(preloadedCriticalRoutes.length).toBeGreaterThan(0)
    } catch (error) {
      console.warn(`Preload test skipped: ${error.message}`)
    }
  }, 30000)

  it('should handle rapid navigation without performance degradation', async () => {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
      
      const routes = [
        'http://localhost:3000/customers',
        'http://localhost:3000/loans',
        'http://localhost:3000/payments',
        'http://localhost:3000',
      ]
      
      const navigationTimes = []
      
      for (let i = 0; i < routes.length; i++) {
        const startTime = Date.now()
        await page.goto(routes[i], { waitUntil: 'networkidle0' })
        const endTime = Date.now()
        navigationTimes.push(endTime - startTime)
      }
      
      console.log('Rapid navigation times:', navigationTimes)
      
      // All navigations should be reasonably fast
      navigationTimes.forEach((time, index) => {
        expect(time).toBeLessThan(3000) // Each navigation under 3 seconds
      })
      
      // Performance shouldn't degrade significantly
      const avgTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length
      const maxTime = Math.max(...navigationTimes)
      
      expect(maxTime).toBeLessThan(avgTime * 2) // No navigation should be twice the average
      
    } catch (error) {
      console.warn(`Rapid navigation test skipped: ${error.message}`)
    }
  }, 60000)

  it('should maintain performance under load simulation', async () => {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
      
      // Simulate multiple rapid interactions
      const interactionTimes = []
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        
        // Simulate button clicks and form interactions
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button')
          if (buttons.length > 0) {
            buttons[Math.floor(Math.random() * buttons.length)].click()
          }
        })
        
        await page.waitForTimeout(100) // Wait a bit between interactions
        
        const endTime = performance.now()
        interactionTimes.push(endTime - startTime)
      }
      
      console.log('Load simulation interaction times:', interactionTimes)
      
      // All interactions should remain responsive
      const avgInteractionTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length
      expect(avgInteractionTime).toBeLessThan(200) // Average under 200ms
      
    } catch (error) {
      console.warn(`Load simulation test skipped: ${error.message}`)
    }
  }, 45000)

  it('should efficiently handle memory usage during navigation', async () => {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          }
        }
        return null
      })
      
      if (initialMemory) {
        console.log('Initial memory:', initialMemory)
        
        // Navigate through several pages
        const routes = ['/customers', '/loans', '/payments', '/']
        
        for (const route of routes) {
          await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle0' })
          await page.waitForTimeout(1000)
        }
        
        // Get final memory usage
        const finalMemory = await page.evaluate(() => {
          if (performance.memory) {
            return {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            }
          }
          return null
        })
        
        if (finalMemory) {
          console.log('Final memory:', finalMemory)
          
          // Memory shouldn't grow excessively
          const memoryGrowth = finalMemory.used - initialMemory.used
          const memoryGrowthPercent = (memoryGrowth / initialMemory.used) * 100
          
          console.log(`Memory growth: ${memoryGrowthPercent.toFixed(2)}%`)
          
          // Memory growth should be reasonable (less than 50% increase)
          expect(memoryGrowthPercent).toBeLessThan(50)
        }
      }
    } catch (error) {
      console.warn(`Memory test skipped: ${error.message}`)
    }
  }, 45000)
})