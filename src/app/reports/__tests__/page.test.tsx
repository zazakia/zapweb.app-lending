import { render, screen, act, fireEvent } from '@testing-library/react'
import ReportsPage from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
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
jest.mock('@/components/DemoModeNotice', () => ({
    __esModule: true,
    default: () => <div>Demo Mode Notice</div>,
}))

describe('Reports Page', () => {
    const mockUserAdmin = { username: 'admin', fullName: 'Admin User', userLevel: 'Admin' }
    const mockUserCashier = { username: 'cashier', fullName: 'Cashier User', userLevel: 'Cashier' }
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })
    })

    it('renders all reports for Admin', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: mockUserAdmin,
            loading: false,
            logout: jest.fn(),
        })

        await act(async () => {
            render(<ReportsPage />)
        })

        expect(screen.getByText('Reports & Analytics')).toBeDefined()
        expect(screen.getByText('Loan Portfolio Analysis')).toBeDefined()
        expect(screen.getByText('Monthly Financial Summary')).toBeDefined() // Admin only
    })

    it('filters reports for Cashier', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: mockUserCashier,
            loading: false,
            logout: jest.fn(),
        })

        await act(async () => {
            render(<ReportsPage />)
        })

        expect(screen.getByText('Loan Portfolio Analysis')).toBeDefined() // Cashier accessible
        expect(screen.queryByText('Monthly Financial Summary')).toBeNull() // Admin only, should be hidden
    })

    it('filters by category', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: mockUserAdmin,
            loading: false,
            logout: jest.fn(),
        })

        await act(async () => {
            render(<ReportsPage />)
        })

        // Click Financial category
        const financialBtn = screen.getByRole('button', { name: /Financial/i })
        await act(async () => {
            fireEvent.click(financialBtn)
        })

        expect(screen.getByText('Loan Portfolio Analysis')).toBeDefined()
        expect(screen.queryByText('Overdue Loans Report')).toBeNull() // Operational category
    })

    it('navigates to report detail', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: mockUserAdmin,
            loading: false,
            logout: jest.fn(),
        })

        await act(async () => {
            render(<ReportsPage />)
        })

        // Find view button for first report
        const viewButtons = screen.getAllByText('View Report')
        await act(async () => {
            fireEvent.click(viewButtons[0])
        })

        expect(mockPush).toHaveBeenCalled()
    })
})
