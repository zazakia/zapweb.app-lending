import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import LoanManagementPage from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { customerService } from '@/lib/services/customerService'
import { loanService } from '@/lib/services/loanService'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('@/lib/services/customerService')
jest.mock('@/lib/services/loanService')
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

// Mock UI components that use Radix
jest.mock('@/components/ui/select', () => ({
    Select: ({ children, onValueChange, value }: any) => (
        <select value={value} onChange={(e) => onValueChange(e.target.value)}>
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

describe('Loan Management Page', () => {
    const mockUser = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
    const mockCustomers = [
        {
            id: 'cust-1',
            customer_code: 'CUS001',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
        }
    ]
    const mockLoanTypes = [
        {
            id: 'type-1',
            type_name: 'Regular Loan',
            interest_rate: 6.0,
            term_months: 1,
            term_days: 30,
        }
    ]
    const mockLoans = [
        {
            id: 'loan-1',
            loan_code: 'L001',
            customer_id: 'cust-1',
            principal_amount: 10000,
            current_balance: 10600,
            release_date: '2023-01-01',
            maturity_date: '2023-01-31',
            approval_status: 'Approved',
            disbursement_status: 'Disbursed',
            loan_status: 'Good',
            customers: mockCustomers[0],
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()

            ; (useAuth as jest.Mock).mockReturnValue({
                user: mockUser,
                loading: false,
                logout: jest.fn(),
            })

            ; (useRouter as jest.Mock).mockReturnValue({
                push: jest.fn(),
            })

            ; (customerService.getCustomers as jest.Mock).mockResolvedValue(mockCustomers)
            ; (loanService.getLoans as jest.Mock).mockResolvedValue(mockLoans)
            ; (loanService.getLoanTypes as jest.Mock).mockResolvedValue(mockLoanTypes)
            ; (loanService.generateLoanCode as jest.Mock).mockResolvedValue('L002')

            // Mock calculation methods
            ; (loanService.calculateInterest as jest.Mock).mockImplementation((p, r) => (p * r) / 100)
            ; (loanService.calculateTotalAmortization as jest.Mock).mockImplementation((p, i) => p + i)
            ; (loanService.calculateMaturityDate as jest.Mock).mockReturnValue('2023-02-01')
    })

    it('renders loan list correctly', async () => {
        await act(async () => {
            render(<LoanManagementPage />)
        })

        expect(screen.getByText('Loan Management')).toBeDefined()
        expect(screen.getByText('L001')).toBeDefined()
        expect(screen.getByText('Juan Dela Cruz')).toBeDefined()
    })

    it('shows loan form when clicking New Loan', async () => {
        await act(async () => {
            render(<LoanManagementPage />)
        })

        const newBtn = screen.getByText('New Loan')

        await act(async () => {
            fireEvent.click(newBtn)
        })

        expect(screen.getByText('Loan Application')).toBeDefined()
        expect(screen.getByLabelText(/Principal Amount/)).toBeDefined()
    })

    it('populates form when editing a loan', async () => {
        await act(async () => {
            render(<LoanManagementPage />)
        })

        const editBtn = screen.getByLabelText('Edit loan')

        await act(async () => {
            fireEvent.click(editBtn)
        })

        expect(screen.getByText('Edit Loan')).toBeDefined()
        expect(screen.getByDisplayValue('10000')).toBeDefined()
    })

    it('updates maturity date when release date changes', async () => {
        await act(async () => {
            render(<LoanManagementPage />)
        })

        await act(async () => {
            fireEvent.click(screen.getByText('New Loan'))
        })

        const releaseInput = screen.getByLabelText(/Release Date/)

        await act(async () => {
            fireEvent.change(releaseInput, { target: { value: '2023-02-01' } })
        })

        expect(loanService.calculateMaturityDate).toHaveBeenCalled()
    })
})
