import { supabase } from '../supabase'
import { mockLoanService } from './mockServices'

export interface LoanType {
  id?: string
  type_name: string
  description?: string
  interest_rate: number
  term_months: number
  term_days?: number
  status: string
}

export interface Loan {
  id?: string
  loan_code: string
  customer_id: string
  loan_type_id: string
  principal_amount: number
  interest_rate: number
  interest_amount: number
  total_amortization: number
  current_balance: number
  term_months?: number
  term_days?: number
  release_date: string
  maturity_date: string
  collector_id?: string
  branch_id?: string
  loan_status: string
  life_insurance: number
  service_fee: number
  loan_category: string
  created_by?: string
  approved_by?: string
  created_at?: string
  updated_at?: string
}

export interface AmortizationSchedule {
  id?: string
  loan_id: string
  payment_number: number
  due_date: string
  principal_amount: number
  interest_amount: number
  total_payment: number
  remaining_balance: number
  payment_status: string
  actual_payment_date?: string
  actual_amount_paid?: number
  created_at?: string
}

export const loanService = {
  // Get all loan types
  async getLoanTypes(): Promise<LoanType[]> {
    if (!supabase) {
      return mockLoanService.getLoanTypes()
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('loan_types')
      .select('*')
      .eq('status', 'Active')
      .order('term_days', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch loan types: ${error.message}`)
    }

    return data || []
  },

  // Get all loans
  async getLoans(): Promise<Loan[]> {
    if (!supabase) {
      return mockLoanService.getLoans()
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('loans')
        .select(`
          *,
          customers(first_name, last_name, customer_code),
          loan_types(type_name),
          collectors(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Failed to fetch from lending1 schema, using mock data:', error.message)
        return mockLoanService.getLoans()
      }

      return data || []
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockLoanService.getLoans()
    }
  },

  // Get loan by ID
  async getLoanById(id: string): Promise<Loan | null> {
    if (!supabase) {
      return mockLoanService.getLoanById(id)
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('loans')
        .select(`
          *,
          customers(first_name, last_name, customer_code),
          loan_types(type_name),
          collectors(first_name, last_name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.warn('Failed to fetch loan from database, using mock data:', error.message)
        return mockLoanService.getLoanById(id)
      }

      return data
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockLoanService.getLoanById(id)
    }
  },

  // Create new loan
  async createLoan(loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>): Promise<Loan> {
    if (!supabase) {
      return mockLoanService.createLoan(loan)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('loans')
      .insert([loan])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create loan: ${error.message}`)
    }

    return data
  },

  // Update loan
  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    if (!supabase) {
      return mockLoanService.updateLoan(id, updates)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('loans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update loan: ${error.message}`)
    }

    return data
  },

  // Generate unique loan code
  async generateLoanCode(): Promise<string> {
    if (!supabase) {
      return mockLoanService.generateLoanCode()
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('loans')
      .select('loan_code')
      .order('loan_code', { ascending: false })
      .limit(1)

    if (error) {
      console.warn('Failed to fetch last loan code, using default format')
    }

    const lastCode = data?.[0]?.loan_code
    if (lastCode && lastCode.startsWith('LN')) {
      const num = parseInt(lastCode.substring(2)) + 1
      return `LN${num.toString().padStart(4, '0')}`
    }

    return 'LN0001'
  },

  // Calculate interest amount based on rate and principal
  calculateInterest(principal: number, rate: number): number {
    return principal * (rate / 100)
  },

  // Calculate total amortization (principal + interest)
  calculateTotalAmortization(principal: number, interest: number): number {
    return principal + interest
  },

  // Calculate maturity date based on release date and term
  calculateMaturityDate(releaseDate: string, termDays: number): string {
    const release = new Date(releaseDate)
    const maturity = new Date(release)
    
    // Add term days, excluding Sundays (business days only)
    let daysAdded = 0
    let currentDate = new Date(release)
    
    while (daysAdded < termDays) {
      currentDate.setDate(currentDate.getDate() + 1)
      
      // Skip Sundays (0 = Sunday)
      if (currentDate.getDay() !== 0) {
        daysAdded++
      }
    }
    
    return currentDate.toISOString().split('T')[0]
  },

  // Create amortization schedule
  async createAmortizationSchedule(loanId: string, loan: Loan): Promise<AmortizationSchedule[]> {
    if (!supabase) {
      return mockLoanService.createAmortizationSchedule(loanId, loan)
    }

    const schedules: Omit<AmortizationSchedule, 'id' | 'created_at'>[] = []
    
    // For now, create a simple single payment schedule
    // In a real system, you might want to support multiple payment schedules
    const schedule: Omit<AmortizationSchedule, 'id' | 'created_at'> = {
      loan_id: loanId,
      payment_number: 1,
      due_date: loan.maturity_date,
      principal_amount: loan.principal_amount,
      interest_amount: loan.interest_amount,
      total_payment: loan.total_amortization,
      remaining_balance: 0,
      payment_status: 'Pending'
    }
    
    schedules.push(schedule)

    const { data, error } = await supabase
      .schema('lending1')
      .from('amortization_schedule')
      .insert(schedules)
      .select()

    if (error) {
      throw new Error(`Failed to create amortization schedule: ${error.message}`)
    }

    return data || []
  },

  // Get amortization schedule for a loan
  async getAmortizationSchedule(loanId: string): Promise<AmortizationSchedule[]> {
    if (!supabase) {
      return mockLoanService.getAmortizationSchedule(loanId)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('amortization_schedule')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_number', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch amortization schedule: ${error.message}`)
    }

    return data || []
  },

  // Search loans
  async searchLoans(searchTerm: string): Promise<Loan[]> {
    if (!supabase) {
      return mockLoanService.searchLoans(searchTerm)
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('loans')
        .select(`
          *,
          customers(first_name, last_name, customer_code),
          loan_types(type_name),
          collectors(first_name, last_name)
        `)
        .or(`loan_code.ilike.%${searchTerm}%,customers.customer_code.ilike.%${searchTerm}%,customers.first_name.ilike.%${searchTerm}%,customers.last_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Failed to search loans from database, using mock data:', error.message)
        return mockLoanService.searchLoans(searchTerm)
      }

      return data || []
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockLoanService.searchLoans(searchTerm)
    }
  },

  // Get loans by customer
  async getLoansByCustomer(customerId: string): Promise<Loan[]> {
    if (!supabase) {
      return mockLoanService.getLoansByCustomer(customerId)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('loans')
      .select(`
        *,
        loan_types(type_name),
        collectors(first_name, last_name)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch customer loans: ${error.message}`)
    }

    return data || []
  },

  // Update loan status
  async updateLoanStatus(loanId: string, status: string): Promise<void> {
    if (!supabase) {
      return mockLoanService.updateLoanStatus(loanId, status)
    }

    const { error } = await supabase
      .schema('lending1')
      .from('loans')
      .update({ 
        loan_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId)

    if (error) {
      throw new Error(`Failed to update loan status: ${error.message}`)
    }
  },

  // Get loans summary statistics
  async getLoansSummary() {
    if (!supabase) {
      return mockLoanService.getLoansSummary()
    }

    try {
      const { data: loans, error } = await supabase
        .schema('lending1')
        .from('loans')
        .select('loan_status, principal_amount, current_balance, total_amortization')

      if (error) {
        console.warn('Failed to fetch loans summary from database, using mock data:', error.message)
        return mockLoanService.getLoansSummary()
      }

      const summary = {
        totalLoans: loans?.length || 0,
        totalPrincipal: loans?.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0) || 0,
        totalCurrentBalance: loans?.reduce((sum, loan) => sum + (loan.current_balance || 0), 0) || 0,
        activeLoans: loans?.filter(loan => loan.loan_status === 'Good').length || 0,
        pastDueLoans: loans?.filter(loan => loan.loan_status === 'Past Due').length || 0,
        fullyPaidLoans: loans?.filter(loan => loan.loan_status === 'Full Paid').length || 0
      }

      return summary
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockLoanService.getLoansSummary()
    }
  }
}