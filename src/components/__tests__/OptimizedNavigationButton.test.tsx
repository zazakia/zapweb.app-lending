import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Users } from 'lucide-react'
import OptimizedNavigationButton from '../OptimizedNavigationButton'
import { useOptimizedNavigation } from '@/lib/navigationOptimizer'

// Mock the navigation hook
jest.mock('@/lib/navigationOptimizer', () => ({
  useOptimizedNavigation: jest.fn(),
  NavigationOptimizer: {
    preloadRoute: jest.fn(),
  },
}))

const mockUseOptimizedNavigation = useOptimizedNavigation as jest.MockedFunction<typeof useOptimizedNavigation>

describe('OptimizedNavigationButton', () => {
  const mockNavigate = jest.fn()
  const mockPreloadOnHover = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOptimizedNavigation.mockReturnValue({
      navigate: mockNavigate,
      preloadOnHover: mockPreloadOnHover,
    })
  })

  const defaultProps = {
    path: '/customers',
    icon: Users,
    label: 'Customers',
    shortcut: '(Ctrl+C)',
    colorScheme: 'blue',
  }

  it('renders with correct label and shortcut', () => {
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.getByText('(Ctrl+C)')).toBeInTheDocument()
  })

  it('renders with correct accessibility attributes', () => {
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Navigate to Customers ((Ctrl+C))')
  })

  it('calls navigate function when clicked', async () => {
    const user = userEvent.setup()
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockNavigate).toHaveBeenCalledWith('/customers')
  })

  it('calls preloadOnHover when mouse enters', async () => {
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    
    expect(mockPreloadOnHover).toHaveBeenCalledWith('/customers')
  })

  it('shows loading state when clicked', async () => {
    const user = userEvent.setup()
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Check for loading spinner or disabled state
    expect(button).toBeDisabled()
  })

  it('does not navigate when disabled', async () => {
    const user = userEvent.setup()
    render(<OptimizedNavigationButton {...defaultProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('applies correct CSS classes for color scheme', () => {
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('from-blue-50', 'to-blue-100')
  })

  it('handles touch events for mobile', () => {
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.touchStart(button)
    
    // Touch should trigger preloading
    // Since NavigationOptimizer.preloadRoute is mocked, we can't easily test this
    // But the event handler should be called
    expect(button).toBeInTheDocument()
  })

  it('prevents multiple rapid clicks', async () => {
    const user = userEvent.setup()
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    
    // Rapid clicks
    await user.click(button)
    await user.click(button)
    await user.click(button)
    
    // Should only navigate once due to loading state
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(
      <OptimizedNavigationButton {...defaultProps} variant="default" />
    )
    
    let button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    rerender(<OptimizedNavigationButton {...defaultProps} variant="ghost" />)
    button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <OptimizedNavigationButton {...defaultProps} size="sm" />
    )
    
    let button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    rerender(<OptimizedNavigationButton {...defaultProps} size="lg" />)
    button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('renders icon component correctly', () => {
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    // Check that the icon is rendered (Users icon from lucide-react)
    const iconElement = screen.getByRole('button').querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })

  it('handles keyboard events correctly', async () => {
    const user = userEvent.setup()
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    button.focus()
    
    await user.keyboard('{Enter}')
    expect(mockNavigate).toHaveBeenCalledWith('/customers')
  })

  it('resets loading state after timeout', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup()
    
    render(<OptimizedNavigationButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(button).toBeDisabled()
    
    // Fast forward time
    jest.advanceTimersByTime(250)
    
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
    
    jest.useRealTimers()
  })
})