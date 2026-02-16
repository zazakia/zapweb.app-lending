import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import CustomerManagementPage from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { customerService } from '@/lib/services/customerService'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('@/lib/services/customerService')
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
jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
}))

describe('Customer Management Page', () => {
    const mockUser = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
    const mockCustomers = [
        {
            id: '1',
            customer_code: 'CUS001',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            phone: '09123456789',
            address: 'Manila',
            credit_score: 95,
            status: 'Active',
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
            ; (customerService.searchCustomers as jest.Mock).mockResolvedValue(mockCustomers)
            ; (customerService.generateCustomerCode as jest.Mock).mockResolvedValue('CUS002')
    })

    it('renders customer list correctly', async () => {
        await act(async () => {
            render(<CustomerManagementPage />)
        })

        expect(screen.getByText('Customer Management')).toBeDefined()
        expect(screen.getByText('Juan Dela Cruz')).toBeDefined()
        expect(screen.getByText('CUS001')).toBeDefined()
    })

    it('searches for customers when typing in search box', async () => {
        await act(async () => {
            render(<CustomerManagementPage />)
        })

        const searchInput = screen.getByPlaceholderText('Search customers...')

        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'Juan' } })
        })

        await waitFor(() => {
            expect(customerService.searchCustomers).toHaveBeenCalledWith('Juan')
        })
    })

    it('shows registration form when clicking Add Customer', async () => {
        await act(async () => {
            render(<CustomerManagementPage />)
        })

        const addButton = screen.getByText('Add Customer')

        await act(async () => {
            fireEvent.click(addButton)
        })

        expect(screen.getByText('Customer Registration')).toBeDefined()
        expect(screen.getByLabelText(/First Name/)).toBeDefined()
    })

    it('populates form when editing a customer', async () => {
        await act(async () => {
            render(<CustomerManagementPage />)
        })

        // Find the edit button (first one in the table)
        const editButton = screen.getByLabelText('Edit customer')

        await act(async () => {
            fireEvent.click(editButton)
        })

        expect(screen.getByText('Edit Customer')).toBeDefined()
        expect(screen.getByDisplayValue('Juan')).toBeDefined()
        expect(screen.getByDisplayValue('Dela Cruz')).toBeDefined()
    })

    it('deletes customer after confirmation', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

        await act(async () => {
            render(<CustomerManagementPage />)
        })

        const moreButton = screen.getByLabelText('More actions')

        await act(async () => {
            fireEvent.click(moreButton)
        })

        const deleteItem = screen.getByText('Delete')

        await act(async () => {
            fireEvent.click(deleteItem)
        })

        expect(confirmSpy).toHaveBeenCalled()
        expect(customerService.deleteCustomer).toHaveBeenCalledWith('1')

        confirmSpy.mockRestore()
    })
})
