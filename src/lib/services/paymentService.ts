import { supabase } from '../supabase'
import { mockPaymentService } from './mockServices'

export interface Payment {
  id?: string
  payment_id: string
  loan_id: string
  customer_id: string
  payment_amount: number
  payment_date: string
  new_balance: number
  days_late: number
  late_payment_fee: number
  is_late_payment: boolean
  payment_method: string
  reference_number?: string
  collector_id?: string
  collected_by?: string
  payment_status: string
  reversed_by?: string
  reversed_at?: string
  reversal_reason?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface PaymentSummary {
  totalPayments: number
  totalAmount: number
  todayPayments: number
  todayAmount: number
  latePayments: number
  latePaymentFees: number
}

export const paymentService = {
  // Get all payments
  async getPayments(): Promise<Payment[]> {
    if (!supabase) {
      return mockPaymentService.getPayments()
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('payments')
        .select(`
          *,
          loans(loan_code, principal_amount, total_amortization),
          customers(first_name, last_name, customer_code),
          collectors(first_name, last_name)
        `)
        .order('payment_date', { ascending: false })

      if (error) {
        console.warn('Failed to fetch payments from database, using mock data:', error.message)
        return mockPaymentService.getPayments()
      }

      return data || []
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockPaymentService.getPayments()
    }
  },

  // Get payment by ID
  async getPaymentById(id: string): Promise<Payment | null> {
    if (!supabase) {
      return mockPaymentService.getPaymentById(id)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select(`
        *,
        loans(loan_code, principal_amount, total_amortization),
        customers(first_name, last_name, customer_code),
        collectors(first_name, last_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch payment: ${error.message}`)
    }

    return data
  },

  // Get payments for a specific loan
  async getPaymentsByLoan(loanId: string): Promise<Payment[]> {
    if (!supabase) {
      return mockPaymentService.getPaymentsByLoan(loanId)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select(`
        *,
        loans(loan_code),
        customers(first_name, last_name, customer_code),
        collectors(first_name, last_name)
      `)
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch loan payments: ${error.message}`)
    }

    return data || []
  },

  // Get payments for a specific customer
  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    if (!supabase) {
      return mockPaymentService.getPaymentsByCustomer(customerId)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select(`
        *,
        loans(loan_code),
        collectors(first_name, last_name)
      `)
      .eq('customer_id', customerId)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch customer payments: ${error.message}`)
    }

    return data || []
  },

  // Create new payment
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    if (!supabase) {
      return mockPaymentService.createPayment(payment)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .insert([payment])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`)
    }

    return data
  },

  // Update payment
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    if (!supabase) {
      return mockPaymentService.updatePayment(id, updates)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`)
    }

    return data
  },

  // Reverse payment
  async reversePayment(id: string, reason: string, reversedBy: string): Promise<void> {
    if (!supabase) {
      return mockPaymentService.reversePayment(id, reason, reversedBy)
    }

    const { error } = await supabase
      .schema('lending1')
      .from('payments')
      .update({
        payment_status: 'Reversed',
        reversed_by: reversedBy,
        reversed_at: new Date().toISOString(),
        reversal_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to reverse payment: ${error.message}`)
    }
  },

  // Generate unique payment ID
  async generatePaymentId(): Promise<string> {
    if (!supabase) {
      return mockPaymentService.generatePaymentId()
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select('payment_id')
      .order('payment_id', { ascending: false })
      .limit(1)

    if (error) {
      console.warn('Failed to fetch last payment ID, using default format')
    }

    const lastId = data?.[0]?.payment_id
    if (lastId && lastId.startsWith('PAY')) {
      const num = parseInt(lastId.substring(3)) + 1
      return `PAY${num.toString().padStart(6, '0')}`
    }

    return 'PAY000001'
  },

  // Calculate late payment information
  calculateLatePayment(maturityDate: string, paymentDate: string): { daysLate: number, isLate: boolean, lateFee: number } {
    const maturity = new Date(maturityDate)
    const payment = new Date(paymentDate)
    
    // Calculate business days between dates (excluding Sundays)
    let daysLate = 0
    const currentDate = new Date(maturity)
    
    while (currentDate < payment) {
      currentDate.setDate(currentDate.getDate() + 1)
      // Only count business days (exclude Sundays)
      if (currentDate.getDay() !== 0) {
        daysLate++
      }
    }

    const isLate = daysLate > 0
    // Late fee calculation: 1% of remaining balance per week or fraction thereof
    const weeksLate = Math.ceil(daysLate / 7)
    const lateFee = isLate ? weeksLate * 50 : 0 // Simple flat fee for now

    return { daysLate, isLate, lateFee }
  },

  // Calculate new balance after payment
  calculateNewBalance(currentBalance: number, paymentAmount: number): number {
    return Math.max(0, currentBalance - paymentAmount)
  },

  // Process payment and update loan balance
  async processPayment(paymentData: {
    loanId: string
    customerId: string
    paymentAmount: number
    paymentDate: string
    paymentMethod?: string
    referenceNumber?: string
    collectorId?: string
    collectedBy?: string
  }): Promise<{ payment: Payment, updatedLoan: any }> {
    if (!supabase) {
      return mockPaymentService.processPayment(paymentData)
    }
    try {
      // Get loan information
      const { data: loan, error: loanError } = await supabase
        .schema('lending1')
        .from('loans')
        .select('*')
        .eq('id', paymentData.loanId)
        .single()

      if (loanError || !loan) {
        throw new Error('Loan not found')
      }

      // Calculate late payment information
      const { daysLate, isLate, lateFee } = this.calculateLatePayment(
        loan.maturity_date,
        paymentData.paymentDate
      )

      // Calculate new balance
      const newBalance = this.calculateNewBalance(loan.current_balance, paymentData.paymentAmount)

      // Generate payment ID
      const paymentId = await this.generatePaymentId()

      // Create payment record
      const payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'> = {
        payment_id: paymentId,
        loan_id: paymentData.loanId,
        customer_id: paymentData.customerId,
        payment_amount: paymentData.paymentAmount,
        payment_date: paymentData.paymentDate,
        new_balance: newBalance,
        days_late: daysLate,
        late_payment_fee: lateFee,
        is_late_payment: isLate,
        payment_method: paymentData.paymentMethod || 'Cash',
        reference_number: paymentData.referenceNumber,
        collector_id: paymentData.collectorId,
        collected_by: paymentData.collectedBy,
        payment_status: 'Active'
      }

      const createdPayment = await this.createPayment(payment)

      // Update loan balance and status
      const loanStatus = newBalance === 0 ? 'Full Paid' : 
                        isLate ? 'Past Due' : 'Good'

      const { data: updatedLoan, error: updateError } = await supabase
        .schema('lending1')
        .from('loans')
        .update({
          current_balance: newBalance,
          loan_status: loanStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentData.loanId)
        .select()
        .single()

      if (updateError) {
        throw new Error('Failed to update loan balance')
      }

      // Update customer credit score if late payment
      if (isLate) {
        const { data: customer } = await supabase
          .schema('lending1')
          .from('customers')
          .select('credit_score, late_payment_count')
          .eq('id', paymentData.customerId)
          .single()

        if (customer) {
          const newLateCount = (customer.late_payment_count || 0) + 1
          const newCreditScore = Math.max(0, (customer.credit_score || 100) - 5) // Deduct 5 points per late payment

          await supabase
            .schema('lending1')
            .from('customers')
            .update({
              credit_score: newCreditScore,
              late_payment_count: newLateCount,
              late_payment_points: (customer.late_payment_points || 0) + 5,
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentData.customerId)
        }
      }

      return { payment: createdPayment, updatedLoan }
    } catch (error) {
      throw new Error(`Failed to process payment: ${error}`)
    }
  },

  // Search payments
  async searchPayments(searchTerm: string): Promise<Payment[]> {
    if (!supabase) {
      return mockPaymentService.searchPayments(searchTerm)
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select(`
        *,
        loans(loan_code),
        customers(first_name, last_name, customer_code),
        collectors(first_name, last_name)
      `)
      .or(`payment_id.ilike.%${searchTerm}%,loans.loan_code.ilike.%${searchTerm}%,customers.customer_code.ilike.%${searchTerm}%,customers.first_name.ilike.%${searchTerm}%`)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to search payments: ${error.message}`)
    }

    return data || []
  },

  // Get payment summary
  async getPaymentSummary(): Promise<PaymentSummary> {
    if (!supabase) {
      return mockPaymentService.getPaymentSummary()
    }

    const { data: payments, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select('payment_amount, payment_date, is_late_payment, late_payment_fee, payment_status')
      .eq('payment_status', 'Active')

    if (error) {
      throw new Error(`Failed to fetch payment summary: ${error.message}`)
    }

    const today = new Date().toISOString().split('T')[0]

    const summary: PaymentSummary = {
      totalPayments: payments?.length || 0,
      totalAmount: payments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0,
      todayPayments: payments?.filter(p => p.payment_date === today).length || 0,
      todayAmount: payments?.filter(p => p.payment_date === today)
                          .reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0,
      latePayments: payments?.filter(p => p.is_late_payment).length || 0,
      latePaymentFees: payments?.reduce((sum, p) => sum + (p.late_payment_fee || 0), 0) || 0
    }

    return summary
  },

  // Get daily collection report
  async getDailyCollectionReport(date: string) {
    if (!supabase) {
      return mockPaymentService.getDailyCollectionReport(date)
    }

    const { data: payments, error } = await supabase
      .schema('lending1')
      .from('payments')
      .select(`
        *,
        loans(loan_code, principal_amount),
        customers(first_name, last_name, customer_code),
        collectors(first_name, last_name)
      `)
      .eq('payment_date', date)
      .eq('payment_status', 'Active')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch daily collection report: ${error.message}`)
    }

    return {
      date,
      payments: payments || [],
      totalCollection: payments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0,
      totalTransactions: payments?.length || 0,
      latePayments: payments?.filter(p => p.is_late_payment).length || 0,
      latePaymentFees: payments?.reduce((sum, p) => sum + (p.late_payment_fee || 0), 0) || 0
    }
  },

  // Process bulk payments
  async processBulkPayments(paymentsData: Array<{
    loanId: string
    customerId: string
    paymentAmount: number
    paymentDate: string
    paymentMethod?: string
    referenceNumber?: string
    collectorId?: string
    collectedBy?: string
  }>): Promise<{ successful: Payment[], failed: Array<{ error: string, data: any }> }> {
    const successful: Payment[] = []
    const failed: Array<{ error: string, data: any }> = []

    for (const paymentData of paymentsData) {
      try {
        const result = await this.processPayment(paymentData)
        successful.push(result.payment)
      } catch (error) {
        failed.push({
          error: error instanceof Error ? error.message : 'Unknown error',
          data: paymentData
        })
      }
    }

    return { successful, failed }
  }
}