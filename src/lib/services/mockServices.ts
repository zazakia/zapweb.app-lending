// Mock services for demo mode when Supabase is not configured
import { Customer } from './customerService'
import { Loan, LoanType } from './loanService'
import { Payment } from './paymentService'

// Mock data
let mockCustomers: Customer[] = [
  {
    id: '1',
    customer_code: 'CUS001',
    first_name: 'Juan',
    middle_name: 'Santos',
    last_name: 'Cruz',
    date_of_birth: '1985-03-15',
    gender: 'Male',
    civil_status: 'Married',
    address: '123 Main St, Quezon City',
    phone: '09171234567',
    email: 'juan.cruz@email.com',
    occupation: 'Teacher',
    employer: 'Public School',
    monthly_income: 25000,
    id1_type: 'Driver\'s License',
    id1_number: 'DL-123456789',
    id1_issued_by: 'LTO',
    id1_expiry_date: '2025-03-15',
    id2_type: 'SSS ID',
    id2_number: 'SSS-987654321',
    id2_issued_by: 'SSS',
    id2_expiry_date: '2030-12-31',
    emergency_contact_name: 'Maria Cruz',
    emergency_contact_phone: '09181234567',
    emergency_contact_relationship: 'Spouse',
    collateral_description: 'Motorcycle',
    collateral_value: 50000,
    loan_purpose: 'Business Capital',
    credit_score: 95,
    late_payment_count: 0,
    late_payment_points: 0,
    status: 'Active',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    customer_code: 'CUS002',
    first_name: 'Maria',
    middle_name: 'Garcia',
    last_name: 'Santos',
    date_of_birth: '1990-07-22',
    gender: 'Female',
    civil_status: 'Single',
    address: '456 Oak Ave, Manila',
    phone: '09281234567',
    email: 'maria.santos@email.com',
    occupation: 'Nurse',
    employer: 'General Hospital',
    monthly_income: 30000,
    id1_type: 'Passport',
    id1_number: 'P1234567',
    id1_issued_by: 'DFA',
    id1_expiry_date: '2028-07-22',
    credit_score: 100,
    late_payment_count: 0,
    late_payment_points: 0,
    status: 'Active',
    created_at: '2025-01-02T00:00:00Z'
  }
]

let mockLoanTypes: LoanType[] = [
  { id: '1', type_name: 'Regular 1 Month', description: 'Regular loan with 1 month term', interest_rate: 6.00, term_months: 1, term_days: 30, status: 'Active' },
  { id: '2', type_name: 'Regular 1.5 Month', description: 'Regular loan with 1.5 month term', interest_rate: 6.00, term_months: 1, term_days: 45, status: 'Active' },
  { id: '3', type_name: 'Regular 2 Month', description: 'Regular loan with 2 month term', interest_rate: 6.00, term_months: 2, term_days: 60, status: 'Active' },
  { id: '4', type_name: 'Emergency 45 Days', description: 'Emergency loan with 45 days term', interest_rate: 6.00, term_months: 1, term_days: 45, status: 'Active' }
]

let mockLoans: Loan[] = [
  {
    id: '1',
    loan_code: 'LN0001',
    customer_id: '1',
    loan_type_id: '1',
    principal_amount: 10000,
    interest_rate: 6.00,
    interest_amount: 600,
    total_amortization: 10600,
    current_balance: 5300,
    term_months: 1,
    term_days: 30,
    release_date: '2025-01-01',
    maturity_date: '2025-01-31',
    loan_status: 'Good',
    life_insurance: 0,
    service_fee: 0,
    loan_category: 'Regular',
    created_at: '2025-01-01T00:00:00Z'
  }
]

let mockPayments: Payment[] = [
  {
    id: '1',
    payment_id: 'PAY000001',
    loan_id: '1',
    customer_id: '1',
    payment_amount: 5300,
    payment_date: '2025-01-15',
    new_balance: 5300,
    days_late: 0,
    late_payment_fee: 0,
    is_late_payment: false,
    payment_method: 'Cash',
    payment_status: 'Active',
    created_at: '2025-01-15T00:00:00Z'
  }
]

// Helper function to simulate async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockCustomerService = {
  async getCustomers(): Promise<Customer[]> {
    await delay(500)
    return [...mockCustomers]
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    await delay(300)
    return mockCustomers.find(c => c.id === id) || null
  },

  async getCustomersCount(): Promise<number> {
    await delay(200)
    return mockCustomers.length
  },

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    await delay(300)
    return mockCustomers.filter(c =>
      c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  },

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    await delay(800)
    const newCustomer: Customer = {
      ...customer,
      id: (mockCustomers.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockCustomers.push(newCustomer)
    return newCustomer
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    await delay(800)
    const index = mockCustomers.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Customer not found')

    mockCustomers[index] = { ...mockCustomers[index], ...updates, updated_at: new Date().toISOString() }
    return mockCustomers[index]
  },

  async deleteCustomer(id: string): Promise<void> {
    await delay(500)
    const index = mockCustomers.findIndex(c => c.id === id)
    if (index !== -1) {
      mockCustomers[index].status = 'Inactive'
    }
  },

  async generateCustomerCode(): Promise<string> {
    await delay(200)
    const lastNum = Math.max(...mockCustomers.map(c => parseInt(c.customer_code.substring(3)) || 0))
    return `CUS${(lastNum + 1).toString().padStart(3, '0')}`
  },

  async updateCreditScore(id: string, newScore: number, latePaymentCount: number): Promise<void> {
    await delay(300)
    const index = mockCustomers.findIndex(c => c.id === id)
    if (index !== -1) {
      mockCustomers[index].credit_score = newScore
      mockCustomers[index].late_payment_count = latePaymentCount
      mockCustomers[index].late_payment_points = 100 - newScore
    }
  }
}

export const mockLoanService = {
  async getLoanTypes(): Promise<LoanType[]> {
    await delay(300)
    return [...mockLoanTypes]
  },

  async getLoans(): Promise<Loan[]> {
    await delay(500)
    return mockLoans.map(loan => ({
      ...loan,
      customers: mockCustomers.find(c => c.id === loan.customer_id),
      loan_types: mockLoanTypes.find(lt => lt.id === loan.loan_type_id)
    })) as any
  },

  async getLoanById(id: string): Promise<Loan | null> {
    await delay(300)
    const loan = mockLoans.find(l => l.id === id)
    if (!loan) return null

    return {
      ...loan,
      customers: mockCustomers.find(c => c.id === loan.customer_id),
      loan_types: mockLoanTypes.find(lt => lt.id === loan.loan_type_id)
    } as any
  },

  async createLoan(loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>): Promise<Loan> {
    await delay(800)
    const newLoan: Loan = {
      ...loan,
      id: (mockLoans.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockLoans.push(newLoan)
    return newLoan
  },

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
    await delay(800)
    const index = mockLoans.findIndex(l => l.id === id)
    if (index === -1) throw new Error('Loan not found')

    mockLoans[index] = { ...mockLoans[index], ...updates, updated_at: new Date().toISOString() }
    return mockLoans[index]
  },

  async generateLoanCode(): Promise<string> {
    await delay(200)
    const lastNum = Math.max(...mockLoans.map(l => parseInt(l.loan_code.substring(2)) || 0))
    return `LN${(lastNum + 1).toString().padStart(4, '0')}`
  },

  calculateInterest: (principal: number, rate: number) => principal * (rate / 100),
  calculateTotalAmortization: (principal: number, interest: number) => principal + interest,
  calculateMaturityDate: (releaseDate: string, termDays: number) => {
    const release = new Date(releaseDate)
    const maturity = new Date(release)
    maturity.setDate(maturity.getDate() + termDays)
    return maturity.toISOString().split('T')[0]
  },

  async createAmortizationSchedule(loanId: string, loan: Loan): Promise<any[]> {
    await delay(300)
    return []
  },

  async searchLoans(searchTerm: string): Promise<Loan[]> {
    await delay(300)
    return mockLoans.filter(l =>
      l.loan_code.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(loan => ({
      ...loan,
      customers: mockCustomers.find(c => c.id === loan.customer_id),
      loan_types: mockLoanTypes.find(lt => lt.id === loan.loan_type_id)
    })) as any
  },

  async getAmortizationSchedule(loanId: string): Promise<any[]> {
    await delay(300)
    return []
  },

  async getLoansByCustomer(customerId: string): Promise<Loan[]> {
    await delay(300)
    return mockLoans.filter(l => l.customer_id === customerId).map(loan => ({
      ...loan,
      customers: mockCustomers.find(c => c.id === loan.customer_id),
      loan_types: mockLoanTypes.find(lt => lt.id === loan.loan_type_id)
    })) as any
  },

  async updateLoanStatus(loanId: string, status: string): Promise<void> {
    await delay(300)
    const index = mockLoans.findIndex(l => l.id === loanId)
    if (index !== -1) {
      mockLoans[index].loan_status = status
    }
  },

  async getLoansSummary() {
    await delay(300)
    return {
      totalLoans: mockLoans.length,
      totalPrincipal: mockLoans.reduce((sum, loan) => sum + loan.principal_amount, 0),
      totalCurrentBalance: mockLoans.reduce((sum, loan) => sum + loan.current_balance, 0),
      activeLoans: mockLoans.filter(loan => loan.loan_status === 'Good').length,
      pastDueLoans: mockLoans.filter(loan => loan.loan_status === 'Past Due').length,
      fullyPaidLoans: mockLoans.filter(loan => loan.loan_status === 'Full Paid').length
    }
  }
}

export const mockPaymentService = {
  async getPayments(): Promise<Payment[]> {
    await delay(500)
    return mockPayments.map(payment => ({
      ...payment,
      loans: mockLoans.find(l => l.id === payment.loan_id),
      customers: mockCustomers.find(c => c.id === payment.customer_id)
    })) as any
  },

  async processPayment(paymentData: any): Promise<{ payment: Payment, updatedLoan: any }> {
    await delay(1000)

    const newPayment: Payment = {
      id: (mockPayments.length + 1).toString(),
      payment_id: `PAY${(mockPayments.length + 1).toString().padStart(6, '0')}`,
      loan_id: paymentData.loanId,
      customer_id: paymentData.customerId,
      payment_amount: paymentData.paymentAmount,
      payment_date: paymentData.paymentDate,
      new_balance: 0, // For demo
      days_late: 0,
      late_payment_fee: 0,
      is_late_payment: false,
      payment_method: paymentData.paymentMethod || 'Cash',
      payment_status: 'Active',
      created_at: new Date().toISOString()
    }

    mockPayments.push(newPayment)

    // Update loan balance
    const loanIndex = mockLoans.findIndex(l => l.id === paymentData.loanId)
    if (loanIndex !== -1) {
      mockLoans[loanIndex].current_balance = Math.max(0, mockLoans[loanIndex].current_balance - paymentData.paymentAmount)
      if (mockLoans[loanIndex].current_balance === 0) {
        mockLoans[loanIndex].loan_status = 'Full Paid'
      }
    }

    return { payment: newPayment, updatedLoan: mockLoans[loanIndex] }
  },

  async searchPayments(searchTerm: string): Promise<Payment[]> {
    await delay(300)
    return mockPayments.filter(p =>
      p.payment_id.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(payment => ({
      ...payment,
      loans: mockLoans.find(l => l.id === payment.loan_id),
      customers: mockCustomers.find(c => c.id === payment.customer_id)
    })) as any
  },


  async generatePaymentId(): Promise<string> {
    await delay(200)
    return `PAY${(mockPayments.length + 1).toString().padStart(6, '0')}`
  },

  async getPaymentById(id: string): Promise<Payment | null> {
    await delay(300)
    const payment = mockPayments.find(p => p.id === id)
    if (!payment) return null

    return {
      ...payment,
      loans: mockLoans.find(l => l.id === payment.loan_id),
      customers: mockCustomers.find(c => c.id === payment.customer_id)
    } as any
  },

  async getPaymentsByLoan(loanId: string): Promise<Payment[]> {
    await delay(300)
    return mockPayments.filter(p => p.loan_id === loanId).map(payment => ({
      ...payment,
      loans: mockLoans.find(l => l.id === payment.loan_id),
      customers: mockCustomers.find(c => c.id === payment.customer_id)
    })) as any
  },

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    await delay(300)
    return mockPayments.filter(p => p.customer_id === customerId).map(payment => ({
      ...payment,
      loans: mockLoans.find(l => l.id === payment.loan_id),
      customers: mockCustomers.find(c => c.id === payment.customer_id)
    })) as any
  },

  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    await delay(800)
    const newPayment: Payment = {
      ...payment,
      id: (mockPayments.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockPayments.push(newPayment)
    return newPayment
  },

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    await delay(800)
    const index = mockPayments.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Payment not found')

    mockPayments[index] = { ...mockPayments[index], ...updates, updated_at: new Date().toISOString() }
    return mockPayments[index]
  },

  async reversePayment(id: string, reason: string, reversedBy: string): Promise<void> {
    await delay(500)
    const index = mockPayments.findIndex(p => p.id === id)
    if (index !== -1) {
      mockPayments[index].payment_status = 'Reversed'
      mockPayments[index].reversed_by = reversedBy
      mockPayments[index].reversal_reason = reason
      mockPayments[index].reversed_at = new Date().toISOString()
    }
  },

  async getPaymentSummary() {
    await delay(300)
    const today = new Date().toISOString().split('T')[0]

    return {
      totalPayments: mockPayments.length,
      totalAmount: mockPayments.reduce((sum, p) => sum + p.payment_amount, 0),
      todayPayments: mockPayments.filter(p => p.payment_date === today).length,
      todayAmount: mockPayments.filter(p => p.payment_date === today).reduce((sum, p) => sum + p.payment_amount, 0),
      latePayments: mockPayments.filter(p => p.is_late_payment).length,
      latePaymentFees: mockPayments.reduce((sum, p) => sum + p.late_payment_fee, 0)
    }
  },

  async getDailyCollectionReport(date: string) {
    await delay(300)
    const dayPayments = mockPayments.filter(p => p.payment_date === date)

    return {
      date,
      payments: dayPayments.map(payment => ({
        ...payment,
        loans: mockLoans.find(l => l.id === payment.loan_id),
        customers: mockCustomers.find(c => c.id === payment.customer_id)
      })),
      totalCollection: dayPayments.reduce((sum, p) => sum + p.payment_amount, 0),
      totalTransactions: dayPayments.length,
      latePayments: dayPayments.filter(p => p.is_late_payment).length,
      latePaymentFees: dayPayments.reduce((sum, p) => sum + p.late_payment_fee, 0)
    }
  }
}