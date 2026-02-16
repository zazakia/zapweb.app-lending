import { collectorService } from '../collectorService'
import { supabase } from '../../supabase'

// Mock dependencies
jest.mock('../../supabase', () => ({
    supabase: {
        from: jest.fn(),
        schema: jest.fn(),
    },
}))

describe('collectorService', () => {
    const mockCollectors = [
        {
            id: '1',
            collector_code: 'COL001',
            first_name: 'Juan',
            last_name: 'Dela Cruz',
            status: 'Active',
            employment_status: 'Active'
        }
    ]

    let mockSupabaseHandler: any

    beforeEach(() => {
        jest.clearAllMocks()

        mockSupabaseHandler = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            then: jest.fn().mockImplementation((onfulfilled) => {
                return Promise.resolve(onfulfilled({ data: [], error: null }))
            }),
        }

            ; (supabase!.schema as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue(mockSupabaseHandler)
            })
    })

    describe('getCollectors', () => {
        it('fetches all collectors', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockCollectors, error: null }))
            })

            const result = await collectorService.getCollectors()
            expect(result).toEqual(mockCollectors)
        })
    })

    describe('getCollectorById', () => {
        it('returns collector by id', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockCollectors[0], error: null }))
            })

            const result = await collectorService.getCollectorById('1')
            expect(result).toEqual(mockCollectors[0])
            expect(mockSupabaseHandler.eq).toHaveBeenCalledWith('id', '1')
        })
    })

    describe('generateCollectorCode', () => {
        it('generates a new code based on last code', async () => {
            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: [{ collector_code: 'COL010' }], error: null }))
            })

            const code = await collectorService.generateCollectorCode()
            expect(code).toBe('COL011')
        })
    })

    describe('createCollector', () => {
        it('creates a collector successfully', async () => {
            const newCollector = { ...mockCollectors[0] }
            delete (newCollector as any).id

            mockSupabaseHandler.then.mockImplementation((onfulfilled: any) => {
                return Promise.resolve(onfulfilled({ data: mockCollectors[0], error: null }))
            })

            const result = await collectorService.createCollector(newCollector as any)
            expect(result).toEqual(mockCollectors[0])
        })
    })
})
