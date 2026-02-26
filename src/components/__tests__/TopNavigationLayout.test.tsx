import { render, screen, act, fireEvent } from '@testing-library/react'
import TopNavigationLayout from '../TopNavigationLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('@/contexts/SettingsContext')

describe('TopNavigationLayout', () => {
    const mockLogout = jest.fn()
    const mockUpdateSettings = jest.fn()
    const mockUser = { username: 'admin', fullName: 'Admin User', userLevel: 'Admin' }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ user: mockUser, logout: mockLogout })
            ; (useSettings as jest.Mock).mockReturnValue({
                settings: { navigationPosition: 'top', compactMode: false },
                updateSettings: mockUpdateSettings
            })
    })

    it('renders correctly', async () => {
        await act(async () => {
            render(<TopNavigationLayout><div>Content</div></TopNavigationLayout>)
        })

        expect(screen.getByText('MELANN LENDING INVESTOR CORP.')).toBeDefined()
        expect(screen.getByText('Admin User')).toBeDefined()
    })

    it('opens settings panel', async () => {
        await act(async () => {
            render(<TopNavigationLayout><div>Content</div></TopNavigationLayout>)
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Settings'))
        })

        expect(screen.getByText('Layout Settings')).toBeDefined()
    })

    it('logs out', async () => {
        await act(async () => {
            render(<TopNavigationLayout><div>Content</div></TopNavigationLayout>)
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Logout'))
        })

        expect(mockLogout).toHaveBeenCalled()
    })
})
