import { render, screen, act, renderHook } from '@testing-library/react'
import { AuthProvider, useAuth, usePermission } from '../AuthContext'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

describe('AuthContext', () => {
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({
                push: mockPush,
            })
        localStorage.clear()
    })

    const TestComponent = () => {
        const { user, login, logout, loading } = useAuth()
        if (loading) return <div>Loading...</div>
        return (
            <div>
                <div data-testid="user">{user ? user.username : 'Guest'}</div>
                <button onClick={() => login('admin', 'admin123')}>Login</button>
                <button onClick={() => logout()}>Logout</button>
            </div>
        )
    }

    it('provides initial guest state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )
        expect(screen.getByTestId('user').textContent).toBe('Guest')
    })

    it('logins successfully with admin credentials', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await act(async () => {
            screen.getByText('Login').click()
        })

        expect(screen.getByTestId('user').textContent).toBe('admin')
        expect(localStorage.getItem('user')).toContain('admin')
    })

    it('restores user from localStorage on mount', () => {
        const userData = { username: 'cashier', fullName: 'Cashier', userLevel: 'Cashier' }
        localStorage.setItem('user', JSON.stringify(userData))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByTestId('user').textContent).toBe('cashier')
    })

    it('logouts successfully', async () => {
        const userData = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
        localStorage.setItem('user', JSON.stringify(userData))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await act(async () => {
            screen.getByText('Logout').click()
        })

        expect(screen.getByTestId('user').textContent).toBe('Guest')
        expect(localStorage.getItem('user')).toBeNull()
        expect(mockPush).toHaveBeenCalledWith('/login')
    })

    describe('usePermission', () => {
        it('returns true for Admin when Admin level is required', () => {
            const userData = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            )

            localStorage.setItem('user', JSON.stringify(userData))

            const { result } = renderHook(() => usePermission('Admin'), { wrapper })
            expect(result.current).toBe(true)
        })

        it('returns false for Cashier when Admin level is required', () => {
            const userData = { username: 'cashier', fullName: 'Cashier', userLevel: 'Cashier' }
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            )

            localStorage.setItem('user', JSON.stringify(userData))

            const { result } = renderHook(() => usePermission('Admin'), { wrapper })
            expect(result.current).toBe(false)
        })

        it('returns true for Admin when Collector level is required', () => {
            const userData = { username: 'admin', fullName: 'Admin', userLevel: 'Admin' }
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <AuthProvider>{children}</AuthProvider>
            )

            localStorage.setItem('user', JSON.stringify(userData))

            const { result } = renderHook(() => usePermission('Collector'), { wrapper })
            expect(result.current).toBe(true)
        })
    })
})
