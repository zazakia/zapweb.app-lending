import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorMonitor from '../ErrorMonitor'
import { errorLogger } from '@/lib/errorLogger'

// Mock the error logger
jest.mock('@/lib/errorLogger', () => ({
  errorLogger: {
    getLogs: jest.fn(() => []),
    getStats: jest.fn(() => ({
      total: 0,
      byLevel: { error: 0, warn: 0, info: 0, debug: 0 },
      bySource: { console: 0, unhandled: 0, promise: 0, network: 0, manual: 0 },
      recentErrors: 0,
    })),
    subscribe: jest.fn(() => jest.fn()),
    clearLogs: jest.fn(),
    exportLogs: jest.fn(() => '[]'),
    exportLogsAsCSV: jest.fn(() => 'timestamp,level,message,source,url'),
  },
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

describe('ErrorMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders error monitor with initial state', () => {
    render(<ErrorMonitor />)
    
    expect(screen.getByText('Error Monitor')).toBeInTheDocument()
    expect(screen.getByText('Real-time error tracking and monitoring')).toBeInTheDocument()
  })

  it('displays error statistics correctly', () => {
    const mockStats = {
      total: 10,
      byLevel: { error: 5, warn: 3, info: 2, debug: 0 },
      bySource: { console: 4, unhandled: 2, promise: 2, network: 2, manual: 0 },
      recentErrors: 3,
    }
    
    ;(errorLogger.getStats as jest.Mock).mockReturnValue(mockStats)
    
    render(<ErrorMonitor />)
    
    expect(screen.getByText('5')).toBeInTheDocument() // Errors
    expect(screen.getByText('3')).toBeInTheDocument() // Warnings
    expect(screen.getByText('2')).toBeInTheDocument() // Info
    expect(screen.getByText('10')).toBeInTheDocument() // Total
  })

  it('can be hidden and shown', async () => {
    const user = userEvent.setup()
    render(<ErrorMonitor />)
    
    // Hide the monitor
    const hideButton = screen.getByRole('button', { name: /hide/i })
    await user.click(hideButton)
    
    // Should show the "Show Error Monitor" button
    expect(screen.getByText('Show Error Monitor')).toBeInTheDocument()
    
    // Show the monitor again
    const showButton = screen.getByText('Show Error Monitor')
    await user.click(showButton)
    
    expect(screen.getByText('Error Monitor')).toBeInTheDocument()
  })

  it('filters logs by level', async () => {
    const user = userEvent.setup()
    const mockLogs = [
      { id: '1', level: 'error', message: 'Error message', source: 'console', timestamp: new Date().toISOString() },
      { id: '2', level: 'warn', message: 'Warning message', source: 'console', timestamp: new Date().toISOString() },
    ]
    
    ;(errorLogger.getLogs as jest.Mock).mockReturnValue(mockLogs)
    
    render(<ErrorMonitor />)
    
    // Change filter to errors only
    const filterSelect = screen.getByDisplayValue('All')
    await user.selectOptions(filterSelect, 'error')
    
    expect(filterSelect).toHaveValue('error')
  })

  it('clears logs when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<ErrorMonitor />)
    
    const clearButton = screen.getByRole('button', { name: /clear logs/i })
    await user.click(clearButton)
    
    expect(errorLogger.clearLogs).toHaveBeenCalled()
  })

  it('exports logs as JSON', async () => {
    const user = userEvent.setup()
    const mockLogs = JSON.stringify([{ id: '1', message: 'test' }])
    
    ;(errorLogger.exportLogs as jest.Mock).mockReturnValue(mockLogs)
    
    // Mock createElement and click
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    
    render(<ErrorMonitor />)
    
    const exportButton = screen.getByRole('button', { name: /Export as JSON/i })
    await user.click(exportButton)
    
    expect(errorLogger.exportLogs).toHaveBeenCalled()
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('exports logs as CSV', async () => {
    const user = userEvent.setup()
    const mockCSV = 'timestamp,level,message\n2023-01-01,error,test'
    
    ;(errorLogger.exportLogsAsCSV as jest.Mock).mockReturnValue(mockCSV)
    
    // Mock createElement and click
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    
    render(<ErrorMonitor />)
    
    const exportButton = screen.getByRole('button', { name: /Export as CSV/i })
    await user.click(exportButton)
    
    expect(errorLogger.exportLogsAsCSV).toHaveBeenCalled()
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('displays error logs correctly', () => {
    const mockLogs = [
      {
        id: '1',
        level: 'error' as const,
        message: 'Test error message',
        source: 'console' as const,
        timestamp: '2023-01-01T10:00:00.000Z',
        context: { userId: '123' },
      },
    ]
    
    ;(errorLogger.getLogs as jest.Mock).mockReturnValue(mockLogs)
    
    render(<ErrorMonitor />)
    
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByText('ERROR')).toBeInTheDocument()
  })

  it('shows error badge when hidden and errors exist', () => {
    const mockStats = {
      total: 5,
      byLevel: { error: 3, warn: 2, info: 0, debug: 0 },
      bySource: { console: 5, unhandled: 0, promise: 0, network: 0, manual: 0 },
      recentErrors: 3,
    }
    
    ;(errorLogger.getStats as jest.Mock).mockReturnValue(mockStats)
    
    render(<ErrorMonitor />)
    
    // Hide the monitor first
    const hideButton = screen.getByRole('button', { name: /hide/i })
    fireEvent.click(hideButton)
    
    // Should show error count badge
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('toggles auto-refresh correctly', async () => {
    const user = userEvent.setup()
    render(<ErrorMonitor />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    // Should toggle auto-refresh state
    expect(refreshButton).toBeInTheDocument()
  })

  it('displays "No logs to display" when empty', () => {
    ;(errorLogger.getLogs as jest.Mock).mockReturnValue([])
    
    render(<ErrorMonitor />)
    
    expect(screen.getByText('No logs to display')).toBeInTheDocument()
  })

  it('subscribes to new errors on mount', () => {
    render(<ErrorMonitor />)
    
    expect(errorLogger.subscribe).toHaveBeenCalled()
  })

  it('handles error context expansion', async () => {
    const user = userEvent.setup()
    const mockLogs = [
      {
        id: '1',
        level: 'error' as const,
        message: 'Test error',
        source: 'console' as const,
        timestamp: '2023-01-01T10:00:00.000Z',
        context: { userId: '123', action: 'button-click' },
      },
    ]
    
    ;(errorLogger.getLogs as jest.Mock).mockReturnValue(mockLogs)
    
    render(<ErrorMonitor />)
    
    const contextToggle = screen.getByText('Context')
    await user.click(contextToggle)
    
    // Should show expanded context
    expect(screen.getByText('"userId"')).toBeInTheDocument()
  })
})