import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import PaymentManagementPage from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { customerService } from '@/lib/services/customerService'
import { loanService } from '@/lib/services/loanService'
import { paymentService } from '@/lib/services/paymentService'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('@/lib/services/customerService')
jest.mock('@/lib/services/loanService')
jest.mock('@/lib/services/paymentService')
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

describe('Payment Management Page', () => {
    const mockUser = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
    const mockCustomers = [
        {
            id: 'cust-1',
            customer_code: 'CUS001',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
        }
    ]
    const mockLoans = [
        {
            id: 'loan-1',
            loan_code: 'L001',
            customer_id: 'cust-1',
            principal_amount: 10000,
            current_balance: 5000,
            loan_status: 'Good',
            customers: mockCustomers[0],
        }
    ]
    const mockPayments = [
        {
            id: 'pay-1',
            payment_id: 'PAY001',
            loan_id: 'loan-1',
            customer_id: 'cust-1',
            payment_amount: 1000,
            payment_date: '2023-01-15',
            payment_method: 'Cash',
            payment_status: 'Active',
            loans: mockLoans[0],
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
            ; (paymentService.getPayments as jest.Mock).mockResolvedValue(mockPayments)
            ; (paymentService.processPayment as jest.Mock).mockResolvedValue({ payment: mockPayments[0], updatedLoan: mockLoans[0], updatedCustomer: mockCustomers[0] })
    })

    it('renders payment history correctly', async () => {
        await act(async () => {
            render(<PaymentManagementPage />)
        })

        expect(screen.getByText('Payment Management')).toBeDefined()
        expect(screen.getByText('PAY001')).toBeDefined()
        expect(screen.getByText('Juan Dela Cruz')).toBeDefined()
    })

    it('shows payment form when clicking New Payment', async () => {
        await act(async () => {
            render(<PaymentManagementPage />)
        })

        const newBtn = screen.getByText('New Payment')

        await act(async () => {
            fireEvent.click(newBtn)
        })

        expect(screen.getByText('Payment Collection')).toBeDefined()
        expect(screen.getByText(/Select Loan/)).toBeDefined()
    })

    it('calculates new balance when payment amount is entered', async () => {
        await act(async () => {
            render(<PaymentManagementPage />)
        })

        await act(async () => {
            fireEvent.click(screen.getByText('New Payment'))
        })

        // Select a loan (using the mocked select which is a standard <select>)
        // formatting: off
        const loanSelect = screen.getAllByRole('combobox')[0]
        await act(async () => {
            fireEvent.change(loanSelect, { target: { value: 'loan-1' } })
        })

        const amountInput = screen.getByLabelText(/Payment Amount/)
        await act(async () => {
            fireEvent.change(amountInput, { target: { value: '1000' } })
        })

        // Current balance 5000 - 1000 = 4000
        // formatCurrency will result in something like "₱4,000.00"
        // Since I'm in a Philippines context as per user rules.
        expect(screen.getByText(/4,000/)).toBeDefined()
    })

    it('reverses payment after confirmation', async () => {
        const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('Error in entry')
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

        await act(async () => {
            render(<PaymentManagementPage />)
        })

        const reverseBtn = screen.getByLabelText('Reverse payment')

        await act(async () => {
            fireEvent.click(reverseBtn)
        })

        expect(promptSpy).toHaveBeenCalled()
        expect(confirmSpy).toHaveBeenCalled()
        expect(paymentService.reversePayment).toHaveBeenCalledWith('pay-1', 'Error in entry', 'admin')

        promptSpy.mockRestore()
        confirmSpy.mockRestore()
    })
})
