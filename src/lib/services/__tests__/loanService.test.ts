import { loanService } from '../loanService'
import { supabase } from '../../supabase'
import { mockLoanService } from '../mockServices'

// Mock dependencies
jest.mock('../../supabase', () => ({
    supabase: {
        from: jest.fn(),
        schema: jest.fn(),
    },
}))

jest.mock('../mockServices', () => ({
    mockLoanService: {
        getLoanTypes: jest.fn(),
        getLoans: jest.fn(),
        getLoanById: jest.fn(),
        createLoan: jest.fn(),
        updateLoan: jest.fn(),
        generateLoanCode: jest.fn(),
        createAmortizationSchedule: jest.fn(),
        getAmortizationSchedule: jest.fn(),
        searchLoans: jest.fn(),
        getLoansByCustomer: jest.fn(),
        updateLoanStatus: jest.fn(),
        getLoansSummary: jest.fn(),
    },
}))

describe('loanService', () => {
    const mockLoanTypes = [
        { id: '1', type_name: 'Regular', interest_rate: 6, term_months: 1, term_days: 30, status: 'Active' }
    ]

    const mockLoans = [
        {
            id: '1',
            loan_code: 'LN0001',
            customer_id: '1',
            loan_type_id: '1',
            principal_amount: 10000,
            interest_rate: 6,
            interest_amount: 600,
            total_amortization: 10600,
            current_balance: 10600,
            release_date: '2025-01-01',
            maturity_date: '2025-01-31',
            loan_status: 'Good',
            life_insurance: 0,
            service_fee: 0,
            loan_category: 'Regular'
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
            range: jest.fn().mockReturnThis(),
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

    describe('getLoanTypes', () => {
        it('fetches active loan types', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockLoanTypes, error: null }))
            })

            const result = await loanService.getLoanTypes()
            expect(result).toEqual(mockLoanTypes)
            expect(supabase!.schema).toHaveBeenCalledWith('lending1')
        })
    })

    describe('calculateInterest', () => {
        it('calculates interest correctly', () => {
            const interest = loanService.calculateInterest(10000, 6)
            expect(interest).toBe(600)
        })
    })

    describe('calculateMaturityDate', () => {
        it('calculates maturity date excluding Sundays', () => {
            const maturity = loanService.calculateMaturityDate('2025-01-01', 30)
            const expectedDate = new Date('2025-02-05').toISOString().split('T')[0]
            expect(maturity).toBe(expectedDate)
        })
    })

    describe('createLoan', () => {
        it('creates a loan successfully', async () => {
            const newLoan = { ...mockLoans[0] }
            delete (newLoan as any).id

            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockLoans[0], error: null }))
            })

            const result = await loanService.createLoan(newLoan)
            expect(result).toEqual(mockLoans[0])
        })
    })

    describe('getLoans', () => {
        it('fetches all loans with relations', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockLoans, error: null }))
            })

            const result = await loanService.getLoans()
            expect(result).toEqual(mockLoans)
        })
    })

    describe('getLoanById', () => {
        it('returns loan by id', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockLoans[0], error: null }))
            })

            const result = await loanService.getLoanById('1')
            expect(result).toEqual(mockLoans[0])
            expect(mockSupabaseHandler.eq).toHaveBeenCalledWith('id', '1')
        })

        it('returns null if loan not found', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: null, error: { code: 'PGRST116' } }))
            })

            const result = await loanService.getLoanById('999')
            expect(result).toBeNull()
        })
    })

    describe('getLoansSummary', () => {
        it('calculates summary statistics correctly', async () => {
            const summaryLoans = [
                { loan_status: 'Good', principal_amount: 10000, current_balance: 5000, total_amortization: 10600 },
                { loan_status: 'Past Due', principal_amount: 5000, current_balance: 5300, total_amortization: 5300 },
                { loan_status: 'Full Paid', principal_amount: 2000, current_balance: 0, total_amortization: 2120 },
            ]

            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: summaryLoans, error: null }))
            })

            const summary = await loanService.getLoansSummary()
            expect(summary.totalLoans).toBe(3)
            expect(summary.activeLoans).toBe(1)
            expect(summary.pastDueLoans).toBe(1)
            expect(summary.fullyPaidLoans).toBe(1)
            expect(summary.totalPrincipal).toBe(17000)
        })
    })

    describe('generateLoanCode', () => {
        it('generates a new code based on last code', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: [{ loan_code: 'LN0010' }], error: null }))
            })

            const code = await loanService.generateLoanCode()
            expect(code).toBe('LN0011')
        })
        describe('updateLoan', () => {
            it('updates loan successfully', async () => {
                const updates = { loan_status: 'Past Due' }
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: { ...mockLoans[0], ...updates }, error: null }))
                })

                const result = await loanService.updateLoan('1', updates)
                expect(result.loan_status).toBe('Past Due')
            })
        })

        describe('amortizationSchedule', () => {
            it('creates amortization schedule', async () => {
                const schedules = [{ loan_id: '1', payment_number: 1, due_date: '2025-01-31', total_payment: 10600, payment_status: 'Pending' }]
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: schedules, error: null }))
                })

                const result = await loanService.createAmortizationSchedule('1', mockLoans[0] as any)
                expect(result).toEqual(schedules)
            })

            it('gets amortization schedule', async () => {
                const schedules = [{ loan_id: '1', payment_number: 1, due_date: '2025-01-31' }]
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: schedules, error: null }))
                })

                const result = await loanService.getAmortizationSchedule('1')
                expect(result).toEqual(schedules)
                expect(mockSupabaseHandler.eq).toHaveBeenCalledWith('loan_id', '1')
            })
        })

        describe('searchLoans', () => {
            it('searches loans with term', async () => {
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: mockLoans, error: null }))
                })

                const result = await loanService.searchLoans('LN0001')
                expect(result).toEqual(mockLoans)
                expect(mockSupabaseHandler.or).toHaveBeenCalled()
            })
        })

        describe('getLoansByCustomer', () => {
            it('fetches loans for a specific customer', async () => {
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: mockLoans, error: null }))
                })

                const result = await loanService.getLoansByCustomer('1')
                expect(result).toEqual(mockLoans)
                expect(mockSupabaseHandler.eq).toHaveBeenCalledWith('customer_id', '1')
            })
        })

        describe('loanStatus', () => {
            it('updates loan status', async () => {
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ error: null }))
                })

                await expect(loanService.updateLoanStatus('1', 'Full Paid')).resolves.not.toThrow()
            })
        })

        describe('loanTypes', () => {
            it('updates loan type', async () => {
                const updates = { type_name: 'Updated Type' }
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: { id: '1', ...updates }, error: null }))
                })

                const result = await loanService.updateLoanType('1', updates)
                expect(result.type_name).toBe('Updated Type')
            })

            it('deletes loan type', async () => {
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ error: null }))
                })

                await expect(loanService.deleteLoanType('1')).resolves.not.toThrow()
            })
        })

        describe('disbursement', () => {
            it('disburses loan successfully', async () => {
                const data = {
                    disbursed_amount: 10000,
                    disbursement_date: '2025-01-01',
                    disbursed_by: 'admin',
                    disbursement_method: 'Cash'
                }
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: { ...mockLoans[0], disbursement_status: 'Disbursed' }, error: null }))
                })

                const result = await loanService.disburseLoan('1', data)
                expect(result.disbursement_status).toBe('Disbursed')
            })

            it('gets loans pending disbursement', async () => {
                mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                    return Promise.resolve(onfulfilled({ data: mockLoans, error: null }))
                })

                const result = await loanService.getLoansPendingDisbursement()
                expect(result).toEqual(mockLoans)
                expect(mockSupabaseHandler.eq).toHaveBeenCalledWith('approval_status', 'Approved')
                expect(mockSupabaseHandler.neq).toHaveBeenCalledWith('disbursement_status', 'Disbursed')
            })
        })
    })
})
