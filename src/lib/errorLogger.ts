// Enhanced Error Logger with Automation
export interface ErrorLogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  stack?: string
  url?: string
  userAgent?: string
  userId?: string
  context?: Record<string, any>
  source: 'console' | 'unhandled' | 'promise' | 'network' | 'manual'
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = []
  private maxLogs = 1000
  private isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  private observers: ((error: ErrorLogEntry) => void)[] = []

  constructor() {
    this.setupAutomaticLogging()
    this.setupPeriodicReporting()
  }

  // Setup automatic error capture
  private setupAutomaticLogging() {
    // Capture console errors
    this.interceptConsole()

    // Capture unhandled errors
    this.setupUnhandledErrorCapture()

    // Capture unhandled promise rejections
    this.setupPromiseRejectionCapture()

    // Capture network errors
    this.setupNetworkErrorCapture()
  }

  // Intercept console methods
  private interceptConsole() {
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    console.error = (...args) => {
      this.logError('error', args.join(' '), 'console', { originalArgs: args })
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      this.logError('warn', args.join(' '), 'console', { originalArgs: args })
      originalWarn.apply(console, args)
    }

    // Optionally capture all console.log for debugging
    if (this.isDevelopment) {
      console.log = (...args) => {
        this.logError('info', args.join(' '), 'console', { originalArgs: args })
        originalLog.apply(console, args)
      }
    }
  }

  // Setup unhandled error capture
  private setupUnhandledErrorCapture() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError('error', event.message, 'unhandled', {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        })
      })
    }
  }

  // Setup promise rejection capture
  private setupPromiseRejectionCapture() {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.logError('error', event.reason?.message || 'Unhandled Promise Rejection', 'promise', {
          reason: event.reason,
          stack: event.reason?.stack
        })
      })
    }
  }

  // Setup network error capture
  private setupNetworkErrorCapture() {
    if (typeof window !== 'undefined') {
      // Intercept fetch requests
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args)
          if (!response.ok) {
            this.logError('error', `Network Error: ${response.status} ${response.statusText}`, 'network', {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            })
          }
          return response
        } catch (error: any) {
          this.logError('error', `Fetch Error: ${error.message}`, 'network', {
            url: args[0],
            error: error.message
          })
          throw error
        }
      }
    }
  }

  // Core logging method
  private logError(
    level: ErrorLogEntry['level'],
    message: string,
    source: ErrorLogEntry['source'],
    context?: Record<string, any>
  ) {
    const entry: ErrorLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }

    this.logs.push(entry)

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Notify observers
    this.observers.forEach(observer => observer(entry))

    // Auto-save to localStorage in development
    if (this.isDevelopment) {
      this.saveToLocalStorage()
    }
  }

  // Public method for manual logging
  public log(level: ErrorLogEntry['level'], message: string, context?: Record<string, any>) {
    this.logError(level, message, 'manual', context)
  }

  // Get all logs
  public getLogs(): ErrorLogEntry[] {
    return [...this.logs]
  }

  // Get logs by level
  public getLogsByLevel(level: ErrorLogEntry['level']): ErrorLogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  // Get recent logs
  public getRecentLogs(minutes: number = 5): ErrorLogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.logs.filter(log => new Date(log.timestamp) > cutoff)
  }

  // Export logs as JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Export logs as CSV
  public exportLogsAsCSV(): string {
    const headers = ['timestamp', 'level', 'message', 'source', 'url']
    const csvData = [
      headers.join(','),
      ...this.logs.map(log => [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.source,
        log.url || ''
      ].join(','))
    ]
    return csvData.join('\n')
  }

  // Clear logs
  public clearLogs() {
    this.logs = []
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('melann-error-logs')
    }
  }

  // Subscribe to real-time error notifications
  public subscribe(callback: (error: ErrorLogEntry) => void) {
    this.observers.push(callback)
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback)
    }
  }

  // Save logs to localStorage
  private saveToLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('melann-error-logs', JSON.stringify(this.logs))
      } catch (error) {
        // Handle localStorage quota exceeded
        this.logs = this.logs.slice(-500) // Keep only last 500 logs
        localStorage.setItem('melann-error-logs', JSON.stringify(this.logs))
      }
    }
  }

  // Load logs from localStorage
  public loadFromLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('melann-error-logs')
        if (stored) {
          this.logs = JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Failed to load error logs from localStorage:', error)
      }
    }
  }

  // Setup periodic reporting
  private setupPeriodicReporting() {
    if (this.isDevelopment) {
      setInterval(() => {
        const recentErrors = this.getRecentLogs(5).filter(log => log.level === 'error')
        if (recentErrors.length > 0) {
          console.group(`🔍 Error Report - ${recentErrors.length} errors in last 5 minutes`)
          recentErrors.forEach(error => {
            console.log(`[${error.timestamp}] ${error.source}: ${error.message}`)
          })
          console.groupEnd()
        }
      }, 5 * 60 * 1000) // Every 5 minutes
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Get error statistics
  public getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {
        error: 0,
        warn: 0,
        info: 0,
        debug: 0
      },
      bySource: {
        console: 0,
        unhandled: 0,
        promise: 0,
        network: 0,
        manual: 0
      },
      recentErrors: this.getRecentLogs(60).length // Last hour
    }

    this.logs.forEach(log => {
      stats.byLevel[log.level]++
      stats.bySource[log.source]++
    })

    return stats
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger()

// Initialize with saved logs
if (typeof window !== 'undefined') {
  errorLogger.loadFromLocalStorage()
}