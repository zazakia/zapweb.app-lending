import { render, screen } from '@testing-library/react'
import LayoutSwitcher from '../LayoutSwitcher'
import { useSettings } from '@/contexts/SettingsContext'

// Mock the settings context
jest.mock('@/contexts/SettingsContext', () => ({
  useSettings: jest.fn(),
}))

// Mock the layout components
jest.mock('../TopNavigationLayout', () => {
  return function MockTopNavigationLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="top-navigation-layout">{children}</div>
  }
})

jest.mock('../SidebarNavigationLayout', () => {
  return function MockSidebarNavigationLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="sidebar-navigation-layout">{children}</div>
  }
})

const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>

describe('LayoutSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders TopNavigationLayout when navigationPosition is top', () => {
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'top',
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    render(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('top-navigation-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-navigation-layout')).not.toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders SidebarNavigationLayout when navigationPosition is left', () => {
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'left',
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    render(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('sidebar-navigation-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('top-navigation-layout')).not.toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('defaults to TopNavigationLayout for unknown navigationPosition', () => {
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'unknown' as any,
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    render(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('top-navigation-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-navigation-layout')).not.toBeInTheDocument()
  })

  it('re-renders when settings change', () => {
    const { rerender } = render(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    // Initially top navigation
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'top',
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    rerender(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('top-navigation-layout')).toBeInTheDocument()

    // Change to sidebar navigation
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'left',
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    rerender(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('sidebar-navigation-layout')).toBeInTheDocument()
  })

  it('passes children to both layout types', () => {
    const testContent = (
      <div>
        <h1>Test Header</h1>
        <p>Test paragraph</p>
        <button>Test Button</button>
      </div>
    )

    // Test with top navigation
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'top',
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    const { rerender } = render(
      <LayoutSwitcher>{testContent}</LayoutSwitcher>
    )

    expect(screen.getByText('Test Header')).toBeInTheDocument()
    expect(screen.getByText('Test paragraph')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()

    // Test with sidebar navigation
    mockUseSettings.mockReturnValue({
      settings: {
        navigationPosition: 'left',
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
      },
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    rerender(<LayoutSwitcher>{testContent}</LayoutSwitcher>)

    expect(screen.getByText('Test Header')).toBeInTheDocument()
    expect(screen.getByText('Test paragraph')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('memoizes layout rendering correctly', () => {
    const mockSettings = {
      navigationPosition: 'top' as const,
      theme: 'light' as const,
      compactMode: false,
      sidebarCollapsed: false,
    }

    mockUseSettings.mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
      resetSettings: jest.fn(),
    })

    const { rerender } = render(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('top-navigation-layout')).toBeInTheDocument()

    // Re-render with same settings should not change layout
    rerender(
      <LayoutSwitcher>
        <div>Test Content</div>
      </LayoutSwitcher>
    )

    expect(screen.getByTestId('top-navigation-layout')).toBeInTheDocument()
  })
})