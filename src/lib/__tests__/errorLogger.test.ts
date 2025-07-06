import { errorLogger, ErrorLogEntry } from '../errorLogger'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock console methods
const originalConsole = { ...console }

describe('ErrorLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset console methods
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.log = originalConsole.log
    
    // Clear logs
    errorLogger.clearLogs()
  })

  afterAll(() => {
    // Restore console methods
    Object.assign(console, originalConsole)
  })

  describe('Manual Logging', () => {
    it('logs error messages correctly', () => {
      errorLogger.log('error', 'Test error message', { userId: '123' })
      
      const logs = errorLogger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toMatchObject({
        level: 'error',
        message: 'Test error message',
        source: 'manual',
        context: { userId: '123' },
      })
      expect(logs[0].id).toBeDefined()
      expect(logs[0].timestamp).toBeDefined()
    })

    it('logs different levels correctly', () => {
      errorLogger.log('error', 'Error message')
      errorLogger.log('warn', 'Warning message')
      errorLogger.log('info', 'Info message')
      errorLogger.log('debug', 'Debug message')
      
      const logs = errorLogger.getLogs()
      expect(logs).toHaveLength(4)
      
      const levels = logs.map(log => log.level)
      expect(levels).toContain('error')
      expect(levels).toContain('warn')
      expect(levels).toContain('info')
      expect(levels).toContain('debug')
    })

    it('generates unique IDs for each log entry', () => {
      errorLogger.log('error', 'Message 1')
      errorLogger.log('error', 'Message 2')
      errorLogger.log('error', 'Message 3')
      
      const logs = errorLogger.getLogs()
      const ids = logs.map(log => log.id)
      const uniqueIds = [...new Set(ids)]
      
      expect(uniqueIds).toHaveLength(3)
    })
  })

  describe('Console Interception', () => {
    it('intercepts console.error calls', () => {
      const originalError = console.error
      console.error('Test console error')
      
      const logs = errorLogger.getLogs()
      const errorLogs = logs.filter(log => log.level === 'error' && log.source === 'console')
      
      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].message).toBe('Test console error')
    })

    it('intercepts console.warn calls', () => {
      console.warn('Test console warning')
      
      const logs = errorLogger.getLogs()
      const warnLogs = logs.filter(log => log.level === 'warn' && log.source === 'console')
      
      expect(warnLogs).toHaveLength(1)
      expect(warnLogs[0].message).toBe('Test console warning')
    })
  })

  describe('Log Management', () => {
    it('maintains maximum log limit', () => {
      // Add more than max logs (assuming max is 1000)
      for (let i = 0; i < 1100; i++) {
        errorLogger.log('info', `Message ${i}`)
      }
      
      const logs = errorLogger.getLogs()
      expect(logs.length).toBeLessThanOrEqual(1000)
    })

    it('clears all logs', () => {
      errorLogger.log('error', 'Test error')
      errorLogger.log('warn', 'Test warning')
      
      expect(errorLogger.getLogs()).toHaveLength(2)
      
      errorLogger.clearLogs()
      
      expect(errorLogger.getLogs()).toHaveLength(0)
    })

    it('filters logs by level', () => {
      errorLogger.log('error', 'Error 1')
      errorLogger.log('error', 'Error 2')
      errorLogger.log('warn', 'Warning 1')
      errorLogger.log('info', 'Info 1')
      
      const errorLogs = errorLogger.getLogsByLevel('error')
      const warnLogs = errorLogger.getLogsByLevel('warn')
      
      expect(errorLogs).toHaveLength(2)
      expect(warnLogs).toHaveLength(1)
      expect(errorLogs.every(log => log.level === 'error')).toBe(true)
    })

    it('gets recent logs correctly', () => {
      // Add some logs
      errorLogger.log('error', 'Old error')
      
      // Mock date to simulate time passing
      const originalDate = Date.now
      Date.now = jest.fn(() => originalDate() + 10 * 60 * 1000) // 10 minutes later
      
      errorLogger.log('error', 'Recent error')
      
      const recentLogs = errorLogger.getRecentLogs(5) // Last 5 minutes
      
      expect(recentLogs).toHaveLength(1)
      expect(recentLogs[0].message).toBe('Recent error')
      
      Date.now = originalDate
    })
  })

  describe('Export Functionality', () => {
    beforeEach(() => {
      errorLogger.log('error', 'Test error', { userId: '123' })
      errorLogger.log('warn', 'Test warning')
    })

    it('exports logs as JSON', () => {
      const exportedLogs = errorLogger.exportLogs()
      const parsedLogs = JSON.parse(exportedLogs)
      
      expect(Array.isArray(parsedLogs)).toBe(true)
      expect(parsedLogs).toHaveLength(2)
      expect(parsedLogs[0]).toHaveProperty('id')
      expect(parsedLogs[0]).toHaveProperty('timestamp')
      expect(parsedLogs[0]).toHaveProperty('level')
      expect(parsedLogs[0]).toHaveProperty('message')
    })

    it('exports logs as CSV', () => {
      const csvExport = errorLogger.exportLogsAsCSV()
      const lines = csvExport.split('\n')
      
      expect(lines[0]).toBe('timestamp,level,message,source,url')
      expect(lines).toHaveLength(3) // Header + 2 data rows
      
      // Check that each data line has the correct number of columns
      lines.slice(1).forEach(line => {
        if (line.trim()) {
          const columns = line.split(',')
          expect(columns.length).toBe(5)
        }
      })
    })
  })

  describe('Observer Pattern', () => {
    it('notifies subscribers when new errors are logged', () => {
      const mockCallback = jest.fn()
      
      const unsubscribe = errorLogger.subscribe(mockCallback)
      
      errorLogger.log('error', 'Test error')
      
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Test error',
        })
      )
      
      unsubscribe()
    })

    it('unsubscribes correctly', () => {
      const mockCallback = jest.fn()
      
      const unsubscribe = errorLogger.subscribe(mockCallback)
      unsubscribe()
      
      errorLogger.log('error', 'Test error')
      
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('supports multiple subscribers', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      
      errorLogger.subscribe(mockCallback1)
      errorLogger.subscribe(mockCallback2)
      
      errorLogger.log('error', 'Test error')
      
      expect(mockCallback1).toHaveBeenCalledTimes(1)
      expect(mockCallback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Statistics', () => {
    beforeEach(() => {
      errorLogger.log('error', 'Error 1')
      errorLogger.log('error', 'Error 2')
      errorLogger.log('warn', 'Warning 1')
      errorLogger.log('info', 'Info 1')
    })

    it('calculates statistics correctly', () => {
      const stats = errorLogger.getStats()
      
      expect(stats.total).toBe(4)
      expect(stats.byLevel.error).toBe(2)
      expect(stats.byLevel.warn).toBe(1)
      expect(stats.byLevel.info).toBe(1)
      expect(stats.byLevel.debug).toBe(0)
      expect(stats.bySource.manual).toBe(4)
    })
  })

  describe('LocalStorage Integration', () => {
    it('saves logs to localStorage', () => {
      errorLogger.log('error', 'Test error')
      
      // In development mode, logs should be saved automatically
      // We can't easily test this due to the environment check
      // But we can test the method directly
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('loads logs from localStorage', () => {
      const mockLogs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Saved error',
          source: 'manual',
        },
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs))
      
      errorLogger.loadFromLocalStorage()
      
      const logs = errorLogger.getLogs()
      expect(logs.some(log => log.message === 'Saved error')).toBe(true)
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      // Should not throw an error
      expect(() => errorLogger.loadFromLocalStorage()).not.toThrow()
    })
  })
})