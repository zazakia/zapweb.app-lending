import { render, screen, act, fireEvent } from '@testing-library/react'
import SettingsPage from '../page'
import { useSettings } from '@/contexts/SettingsContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/SettingsContext')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))
jest.mock('@/components/ProtectedRoute', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))
jest.mock('@/components/LayoutSwitcher', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

describe('Settings Page', () => {
    const mockUpdateSettings = jest.fn()
    const mockResetSettings = jest.fn()
    const mockPush = jest.fn()
    const mockBack = jest.fn()

    const defaultSettings = {
        theme: 'light',
        navigationPosition: 'top',
        compactMode: false,
        sidebarCollapsed: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useSettings as jest.Mock).mockReturnValue({
                settings: defaultSettings,
                updateSettings: mockUpdateSettings,
                resetSettings: mockResetSettings,
            })
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
                back: mockBack,
            })
    })

    it('renders settings options correctly', async () => {
        await act(async () => {
            render(<SettingsPage />)
        })

        expect(screen.getByText('Application Settings')).toBeDefined()
        expect(screen.getByText('Layout Configuration')).toBeDefined()
        expect(screen.getByText('Appearance')).toBeDefined()
    })

    it('updates layout settings', async () => {
        await act(async () => {
            render(<SettingsPage />)
        })

        const leftSidebarBtn = screen.getByText('Left Sidebar')
        await act(async () => {
            fireEvent.click(leftSidebarBtn)
        })

        expect(mockUpdateSettings).toHaveBeenCalledWith({ navigationPosition: 'left' })
    })

    it('toggles compact mode', async () => {
        await act(async () => {
            render(<SettingsPage />)
        })

        // Find compact mode toggle button
        const toggleBtn = screen.getByLabelText('Toggle compact mode')

        await act(async () => {
            fireEvent.click(toggleBtn)
        })

        expect(mockUpdateSettings).toHaveBeenCalledWith({ compactMode: true })
    })

    it('updates theme settings', async () => {
        await act(async () => {
            render(<SettingsPage />)
        })

        const darkThemeBtn = screen.getByText('Dark')
        await act(async () => {
            fireEvent.click(darkThemeBtn)
        })

        expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'dark' })
    })

    it('resets settings', async () => {
        await act(async () => {
            render(<SettingsPage />)
        })

        const resetBtn = screen.getByText('Reset to Defaults')
        await act(async () => {
            fireEvent.click(resetBtn)
        })

        expect(mockResetSettings).toHaveBeenCalled()
    })
})
