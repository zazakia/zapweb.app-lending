import { supabase } from '../supabase'
import { mockCustomerService } from './mockServices'

export interface Customer {
  id?: string
  customer_code: string
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth?: string
  gender?: string
  civil_status?: string
  address?: string
  phone?: string
  email?: string
  occupation?: string
  employer?: string
  monthly_income?: number
  id1_type?: string
  id1_number?: string
  id1_issued_by?: string
  id1_expiry_date?: string
  id2_type?: string
  id2_number?: string
  id2_issued_by?: string
  id2_expiry_date?: string
  credit_score: number
  late_payment_count: number
  late_payment_points: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  collateral_description?: string
  collateral_value?: number
  loan_purpose?: string
  branch_id?: string
  created_by?: string
  status: string
  created_at?: string
  updated_at?: string
}

export const customerService = {
  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    if (!supabase) {
      return mockCustomerService.getCustomers()
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Failed to fetch customers from database, using mock data:', error.message)
        return mockCustomerService.getCustomers()
      }

      return data || []
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockCustomerService.getCustomers()
    }
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer | null> {
    if (!supabase) {
      return mockCustomerService.getCustomerById(id)
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Customer not found
        }
        console.warn('Failed to fetch customer from database, using mock data:', error.message)
        return mockCustomerService.getCustomerById(id)
      }

      return data
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockCustomerService.getCustomerById(id)
    }
  },

  // Search customers
  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    if (!supabase) {
      return mockCustomerService.searchCustomers(searchTerm)
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,customer_code.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Failed to search customers from database, using mock data:', error.message)
        return mockCustomerService.searchCustomers(searchTerm)
      }

      return data || []
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockCustomerService.searchCustomers(searchTerm)
    }
  },

  // Create new customer
  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    if (!supabase) {
      return mockCustomerService.createCustomer(customer)
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('customers')
        .insert([customer])
        .select()
        .single()

      if (error) {
        console.warn('Failed to create customer in database, using mock service:', error.message)
        return mockCustomerService.createCustomer(customer)
      }

      return data
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockCustomerService.createCustomer(customer)
    }
  },

  // Update customer
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (!supabase) {
      return mockCustomerService.updateCustomer(id, updates)
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.warn('Failed to update customer in database, using mock service:', error.message)
        return mockCustomerService.updateCustomer(id, updates)
      }

      return data
    } catch (error) {
      console.warn('Schema error, falling back to mock data:', error)
      return mockCustomerService.updateCustomer(id, updates)
    }
  },

  // Delete customer (soft delete by updating status)
  async deleteCustomer(id: string): Promise<void> {
    if (!supabase) {
      return mockCustomerService.deleteCustomer(id)
    }

    const { error } = await supabase
      .schema('lending1')
      .from('customers')
      .update({ status: 'Inactive', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete customer: ${error.message}`)
    }
  },

  // Generate unique customer code
  async generateCustomerCode(): Promise<string> {
    if (!supabase) {
      return mockCustomerService.generateCustomerCode()
    }

    try {
      const { data, error } = await supabase
        .schema('lending1')
        .from('customers')
        .select('customer_code')
        .order('customer_code', { ascending: false })
        .limit(1)

      if (error) {
        console.warn('Failed to fetch last customer code from database, using mock service:', error.message)
        return mockCustomerService.generateCustomerCode()
      }

      const lastCode = data?.[0]?.customer_code
      if (lastCode && lastCode.startsWith('CUS')) {
        const num = parseInt(lastCode.substring(3)) + 1
        return `CUS${num.toString().padStart(3, '0')}`
      }

      return 'CUS001'
    } catch (error) {
      console.warn('Schema error, falling back to mock service:', error)
      return mockCustomerService.generateCustomerCode()
    }
  },

  // Update credit score
  async updateCreditScore(id: string, newScore: number, latePaymentCount: number): Promise<void> {
    if (!supabase) {
      return mockCustomerService.updateCreditScore(id, newScore, latePaymentCount)
    }

    const { error } = await supabase
      .schema('lending1')
      .from('customers')
      .update({ 
        credit_score: newScore,
        late_payment_count: latePaymentCount,
        late_payment_points: (100 - newScore),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update credit score: ${error.message}`)
    }
  }
}