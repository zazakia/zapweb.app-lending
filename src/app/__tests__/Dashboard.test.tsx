import { render, screen, act, fireEvent } from '@testing-library/react'
import Dashboard from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { customerService } from '@/lib/services/customerService'
import { loanService } from '@/lib/services/loanService'
import { paymentService } from '@/lib/services/paymentService'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('@/contexts/SettingsContext')
jest.mock('@/lib/services/customerService')
jest.mock('@/lib/services/loanService')
jest.mock('@/lib/services/paymentService')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))
jest.mock('@/hooks/usePerformanceOptimizations', () => ({
    usePerformanceOptimizations: jest.fn(),
    useWebVitalsOptimizations: jest.fn(),
}))

describe('Dashboard Page', () => {
    const mockUser = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
    const mockSettings = { navigationPosition: 'top' }

    const mockStats = {
        totalClients: 10,
        totalLoans: 5,
        totalPrincipal: 50000,
        totalPayments: 25000,
        activeLoans: 4,
        pastDueLoans: 1,
    }

    beforeEach(() => {
        jest.clearAllMocks()

            ; (useAuth as jest.Mock).mockReturnValue({
                user: mockUser,
                loading: false,
                logout: jest.fn(),
            })

            ; (useSettings as jest.Mock).mockReturnValue({
                settings: mockSettings,
            })

            ; (useRouter as jest.Mock).mockReturnValue({
                push: jest.fn(),
            })

            ; (customerService.getCustomers as jest.Mock).mockResolvedValue(new Array(mockStats.totalClients))
            ; (loanService.getLoansSummary as jest.Mock).mockResolvedValue({
                totalLoans: mockStats.totalLoans,
                totalPrincipal: mockStats.totalPrincipal,
                activeLoans: mockStats.activeLoans,
                pastDueLoans: mockStats.pastDueLoans,
            })
            ; (paymentService.getPaymentSummary as jest.Mock).mockResolvedValue({
                totalAmount: mockStats.totalPayments,
            })
    })

    it('renders dashboard with stats correctly', async () => {
        await act(async () => {
            render(<Dashboard />)
        })

        expect(screen.getByText('MELANN LENDING INVESTOR CORP.')).toBeDefined()
        expect(screen.getByText('Total Clients')).toBeDefined()
        expect(screen.getByText(mockStats.totalClients.toString())).toBeDefined()
        expect(screen.getByText(mockStats.totalLoans.toString())).toBeDefined()
        expect(screen.getByText(mockStats.activeLoans.toString())).toBeDefined()
        expect(screen.getByText(mockStats.pastDueLoans.toString())).toBeDefined()
    })

    it('calculates and displays rate of return correctly', async () => {
        await act(async () => {
            render(<Dashboard />)
        })

        // (25000 / 50000) * 100 = 50.00%
        expect(screen.getByText('50.00')).toBeDefined()
    })

    it('refreshes data when refresh button is clicked', async () => {
        await act(async () => {
            render(<Dashboard />)
        })

        const refreshButton = screen.getByText('Refresh Dashboard Data')

        await act(async () => {
            fireEvent.click(refreshButton)
        })

        expect(loanService.getLoansSummary).toHaveBeenCalledTimes(2)
    })

    it('shows loading state initially', async () => {
        // Make service calls hang indefinitely for this test
        ; (loanService.getLoansSummary as jest.Mock).mockReturnValue(new Promise(() => { }))

        render(<Dashboard />)

        expect(screen.getByText('Loading dashboard...')).toBeDefined()
    })

    it('handles errors gracefully by showing fallback data', async () => {
        // console.error is expected here
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (loanService.getLoansSummary as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

        await act(async () => {
            render(<Dashboard />)
        })

        // Fallback data for Total Clients is 1247 according to source code
        expect(screen.getByText('1,247')).toBeDefined()
        consoleSpy.mockRestore()
    })
})
