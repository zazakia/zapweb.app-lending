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

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders error monitor with initial state', () => {
    render(<ErrorMonitor initialVisible={true} />)
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
      ; (errorLogger.getStats as jest.Mock).mockReturnValue(mockStats)
    render(<ErrorMonitor initialVisible={true} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('can be hidden and shown', () => {
    render(<ErrorMonitor initialVisible={true} />)
    const hideButton = screen.getByRole('button', { name: /hide/i })
    fireEvent.click(hideButton)
    expect(screen.getByText('Show Error Monitor')).toBeInTheDocument()
    const showButton = screen.getByText('Show Error Monitor')
    fireEvent.click(showButton)
    expect(screen.getByText('Error Monitor')).toBeInTheDocument()
  })

  it('filters logs by level', () => {
    const mockLogs = [{ id: '1', message: 'Error', level: 'error', timestamp: new Date().toISOString(), source: 'console' }]
      ; (errorLogger.getLogs as jest.Mock).mockReturnValue(mockLogs)
    render(<ErrorMonitor initialVisible={true} />)
    const filterSelect = screen.getByRole('combobox')
    fireEvent.change(filterSelect, { target: { value: 'error' } })
    expect(filterSelect).toHaveValue('error')
  })

  it('clears logs when clear button is clicked', () => {
    render(<ErrorMonitor initialVisible={true} />)
    const clearButton = screen.getByRole('button', { name: /clear logs/i })
    fireEvent.click(clearButton)
    expect(errorLogger.clearLogs).toHaveBeenCalled()
  })

  it('exports logs as JSON', () => {
    const mockLogs = JSON.stringify([{ id: '1', message: 'test' }])
      ; (errorLogger.exportLogs as jest.Mock).mockReturnValue(mockLogs)
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { })

    render(<ErrorMonitor initialVisible={true} />)
    const exportButton = screen.getByRole('button', { name: /Export as JSON/i })
    fireEvent.click(exportButton)

    expect(errorLogger.exportLogs).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('exports logs as CSV', () => {
    const mockCSV = 'timestamp,level,message\n2023-01-01,error,test'
      ; (errorLogger.exportLogsAsCSV as jest.Mock).mockReturnValue(mockCSV)
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { })

    render(<ErrorMonitor initialVisible={true} />)
    const exportButton = screen.getByRole('button', { name: /Export as CSV/i })
    fireEvent.click(exportButton)

    expect(errorLogger.exportLogsAsCSV).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('displays error logs correctly', () => {
    const mockLogs = [{ id: '1', message: 'Test Error', level: 'error', timestamp: new Date().toISOString(), source: 'console' }]
      ; (errorLogger.getLogs as jest.Mock).mockReturnValue(mockLogs)
    render(<ErrorMonitor initialVisible={true} />)
    expect(screen.getByText('Test Error')).toBeInTheDocument()
    expect(screen.getByText('ERROR')).toBeInTheDocument()
    expect(screen.getByText('🖥️')).toBeInTheDocument()
  })

  it('shows error badge when hidden and errors exist', () => {
    const mockStats = { total: 5, byLevel: { error: 5, warn: 0, info: 0, debug: 0 }, recentErrors: 5 }
      ; (errorLogger.getStats as jest.Mock).mockReturnValue(mockStats)
    render(<ErrorMonitor initialVisible={false} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('toggles auto-refresh correctly', () => {
    render(<ErrorMonitor initialVisible={true} />)
    const refreshButton = screen.getByTitle(/refresh/i) || screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
  })

  it('displays "No logs to display" when empty', () => {
    ; (errorLogger.getLogs as jest.Mock).mockReturnValue([])
    render(<ErrorMonitor initialVisible={true} />)
    expect(screen.getByText('No logs to display')).toBeInTheDocument()
  })

  it('subscribes to new errors on mount', () => {
    render(<ErrorMonitor initialVisible={true} />)
    expect(errorLogger.subscribe).toHaveBeenCalled()
  })

  it('handles error context expansion', () => {
    const mockLogs = [{ id: '1', message: 'Test Error', level: 'error', timestamp: new Date().toISOString(), source: 'console', context: { detail: 'Expanded info' } }]
      ; (errorLogger.getLogs as jest.Mock).mockReturnValue(mockLogs)
    render(<ErrorMonitor initialVisible={true} />)
    const contextToggle = screen.getByText('Context')
    fireEvent.click(contextToggle)
    expect(screen.getByText(/Expanded info/i)).toBeInTheDocument()
  })
})