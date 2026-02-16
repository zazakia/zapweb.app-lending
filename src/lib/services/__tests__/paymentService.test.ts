import { paymentService } from '../paymentService'
import { supabase } from '../../supabase'
import { mockPaymentService } from '../mockServices'

// Mock dependencies
jest.mock('../../supabase', () => ({
    supabase: {
        from: jest.fn(),
        schema: jest.fn(),
    },
}))

jest.mock('../mockServices', () => ({
    mockPaymentService: {
        getPayments: jest.fn(),
        getPaymentById: jest.fn(),
        getPaymentsByLoan: jest.fn(),
        getPaymentsByCustomer: jest.fn(),
        createPayment: jest.fn(),
        updatePayment: jest.fn(),
        reversePayment: jest.fn(),
        generatePaymentId: jest.fn(),
        processPayment: jest.fn(),
        searchPayments: jest.fn(),
        getPaymentSummary: jest.fn(),
        getDailyCollectionReport: jest.fn(),
        processBulkPayments: jest.fn(),
    },
}))

describe('paymentService', () => {
    const mockPayments = [
        {
            id: '1',
            payment_id: 'PAY000001',
            loan_id: '1',
            customer_id: '1',
            payment_amount: 1000,
            payment_date: '2025-01-31',
            new_balance: 9600,
            days_late: 0,
            late_payment_fee: 0,
            is_late_payment: false,
            payment_method: 'Cash',
            payment_status: 'Active'
        }
    ]

    let mockSupabaseHandler: any

    beforeEach(() => {
        jest.clearAllMocks()

        // Create a chainable mock handler
        mockSupabaseHandler = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            then: jest.fn().mockImplementation((onfulfilled) => {
                return Promise.resolve(onfulfilled({ data: [], error: null }))
            }),
        }

            ; (supabase!.schema as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue(mockSupabaseHandler)
            })
            ; (supabase!.from as jest.Mock).mockReturnValue(mockSupabaseHandler)
    })

    describe('getPayments', () => {
        it('fetches all payments with relations', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockPayments, error: null }))
            })

            const result = await paymentService.getPayments()
            expect(result).toEqual(mockPayments)
        })
    })

    describe('calculateLatePayment', () => {
        it('calculates 0 days late if paid on or before maturity', () => {
            const result = paymentService.calculateLatePayment('2025-01-31', '2025-01-31')
            expect(result.daysLate).toBe(0)
            expect(result.isLate).toBe(false)
        })

        it('calculates days late excluding Sundays', () => {
            // Jan 31 (Fri) maturitiy, Feb 3 (Mon) payment
            // Feb 1 (Sat) - 1 day
            // Feb 2 (Sun) - skip
            // Feb 3 (Mon) - 1 day
            // Total 2 days late
            const result = paymentService.calculateLatePayment('2025-01-31', '2025-02-03')
            expect(result.daysLate).toBe(2)
            expect(result.isLate).toBe(true)
            expect(result.lateFee).toBe(50) // 1 week or fraction thereof
        })
    })

    describe('processPayment', () => {
        it('processes a payment and updates loan/customer successfully', async () => {
            const mockLoan = {
                id: '1',
                maturity_date: '2025-01-31',
                current_balance: 10600,
                loan_status: 'Good'
            }

            const mockCustomer = {
                id: '1',
                credit_score: 100,
                late_payment_count: 0,
                late_payment_points: 0
            }

            const paymentData = {
                loanId: '1',
                customerId: '1',
                paymentAmount: 1000,
                paymentDate: '2025-02-03' // 2 days late
            }

            // Mock sequence of Supabase calls
            // 1. Get loan
            // 2. Generate payment ID (select from payments)
            // 3. Create payment (insert)
            // 4. Update loan (update)
            // 5. Get customer (select from customers)
            // 6. Update customer (update)

            let callCount = 0
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                callCount++
                if (callCount === 1) return Promise.resolve(onfulfilled({ data: mockLoan, error: null }))
                if (callCount === 2) return Promise.resolve(onfulfilled({ data: [{ payment_id: 'PAY000001' }], error: null }))
                if (callCount === 3) return Promise.resolve(onfulfilled({ data: mockPayments[0], error: null }))
                if (callCount === 4) return Promise.resolve(onfulfilled({ data: { ...mockLoan, current_balance: 9600 }, error: null }))
                if (callCount === 5) return Promise.resolve(onfulfilled({ data: mockCustomer, error: null }))
                if (callCount === 6) return Promise.resolve(onfulfilled({ error: null }))
                return Promise.resolve(onfulfilled({ data: [], error: null }))
            })

            const result = await paymentService.processPayment(paymentData)
            expect(result.payment).toBeDefined()
            expect(result.updatedLoan.current_balance).toBe(9600)
            expect(mockSupabaseHandler.update).toHaveBeenCalledWith(expect.objectContaining({
                loan_status: 'Past Due'
            }))
        })
    })

    describe('getPaymentSummary', () => {
        it('calculates summary correctly', async () => {
            const summaryPayments = [
                { payment_amount: 1000, payment_date: new Date().toISOString().split('T')[0], is_late_payment: false, late_payment_fee: 0, payment_status: 'Active' },
                { payment_amount: 500, payment_date: '2025-01-01', is_late_payment: true, late_payment_fee: 50, payment_status: 'Active' },
            ]

            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: summaryPayments, error: null }))
            })

            const summary = await paymentService.getPaymentSummary()
            expect(summary.totalPayments).toBe(2)
            expect(summary.totalAmount).toBe(1500)
            expect(summary.todayPayments).toBe(1)
            expect(summary.latePayments).toBe(1)
        })
    })

    describe('reversePayment', () => {
        it('reverses a payment successfully', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ error: null }))
            })

            await expect(paymentService.reversePayment('1', 'Error', 'admin')).resolves.not.toThrow()
            expect(mockSupabaseHandler.update).toHaveBeenCalledWith(expect.objectContaining({
                payment_status: 'Reversed'
            }))
        })
    })
})
