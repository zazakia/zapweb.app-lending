import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

describe('Login Page', () => {
    const mockLogin = jest.fn()
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            ; (useAuth as jest.Mock).mockReturnValue({
                login: mockLogin,
                loading: false,
            })

            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })
    })

    it('renders login form correctly', async () => {
        await act(async () => {
            render(<LoginPage />)
        })

        expect(screen.getByText('User Login')).toBeDefined()
        expect(screen.getByLabelText(/Username/)).toBeDefined()
        expect(screen.getByLabelText(/Password/)).toBeDefined()
        expect(screen.getByRole('button', { name: /Login/i })).toBeDefined()
    })

    it('handles successful login', async () => {
        mockLogin.mockResolvedValue(true)

        await act(async () => {
            render(<LoginPage />)
        })

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'admin' } })
            fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'password' } })
            fireEvent.click(screen.getByRole('button', { name: /Login/i }))
        })

        expect(mockLogin).toHaveBeenCalledWith('admin', 'password')
        expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('handles failed login', async () => {
        mockLogin.mockResolvedValue(false)

        await act(async () => {
            render(<LoginPage />)
        })

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'wrong' } })
            fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'wrong' } })
            fireEvent.click(screen.getByRole('button', { name: /Login/i }))
        })

        expect(mockLogin).toHaveBeenCalledWith('wrong', 'wrong')
        expect(await screen.findByText('Invalid username or password')).toBeDefined()
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('displays error on exception', async () => {
        mockLogin.mockRejectedValue(new Error('Network error'))

        await act(async () => {
            render(<LoginPage />)
        })

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'admin' } })
            fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'password' } })
            fireEvent.click(screen.getByRole('button', { name: /Login/i }))
        })

        expect(await screen.findByText('Login failed. Please try again.')).toBeDefined()
    })
})
