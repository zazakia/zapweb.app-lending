import { supabase } from '../supabase'

export interface Collector {
  id?: string
  collector_code: string
  first_name: string
  middle_name?: string
  last_name: string
  contact_number: string
  email?: string
  address?: string
  hire_date: string
  employment_status: string
  assigned_area?: string
  commission_rate: number
  id_type: string
  id_number: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  branch_id?: string
  created_by?: string
  status: string
  created_at?: string
  updated_at?: string
}

// Mock data for collectors
const mockCollectors: Collector[] = [
  {
    id: '1',
    collector_code: 'COL001',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    contact_number: '09123456789',
    email: 'juan.delacruz@melann.com',
    address: 'Quezon City',
    hire_date: '2023-01-15',
    employment_status: 'Active',
    assigned_area: 'District 1',
    commission_rate: 5.0,
    id_type: 'Driver\'s License',
    id_number: 'N01-23-456789',
    emergency_contact_name: 'Maria Dela Cruz',
    emergency_contact_phone: '09987654321',
    status: 'Active',
    created_at: '2023-01-15T08:00:00.000Z'
  },
  {
    id: '2',
    collector_code: 'COL002',
    first_name: 'Anna',
    last_name: 'Santos',
    contact_number: '09234567890',
    email: 'anna.santos@melann.com',
    address: 'Makati City',
    hire_date: '2023-03-20',
    employment_status: 'Active',
    assigned_area: 'District 2',
    commission_rate: 5.0,
    id_type: 'SSS ID',
    id_number: '06-1234567-8',
    emergency_contact_name: 'Pedro Santos',
    emergency_contact_phone: '09876543210',
    status: 'Active',
    created_at: '2023-03-20T08:00:00.000Z'
  }
]

export const collectorService = {
  // Get all collectors
  async getCollectors(): Promise<Collector[]> {
    if (!supabase) {
      return mockCollectors
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('collectors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Failed to fetch from database, using mock data:', error.message)
      return mockCollectors
    }

    return data || []
  },

  // Get collector by ID
  async getCollectorById(id: string): Promise<Collector | null> {
    if (!supabase) {
      return mockCollectors.find(c => c.id === id) || null
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('collectors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      const mockCollector = mockCollectors.find(c => c.id === id) || null
      return mockCollector
    }

    return data
  },

  // Search collectors
  async searchCollectors(searchTerm: string): Promise<Collector[]> {
    if (!supabase) {
      return mockCollectors.filter(collector => 
        collector.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.collector_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.contact_number.includes(searchTerm)
      )
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('collectors')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,collector_code.ilike.%${searchTerm}%,contact_number.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Search failed, using mock data:', error.message)
      return mockCollectors.filter(collector => 
        collector.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.collector_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.contact_number.includes(searchTerm)
      )
    }

    return data || []
  },

  // Create new collector
  async createCollector(collector: Omit<Collector, 'id' | 'created_at' | 'updated_at'>): Promise<Collector> {
    if (!supabase) {
      const newCollector: Collector = {
        ...collector,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      mockCollectors.unshift(newCollector)
      return newCollector
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('collectors')
      .insert([collector])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create collector: ${error.message}`)
    }

    return data
  },

  // Update collector
  async updateCollector(id: string, updates: Partial<Collector>): Promise<Collector> {
    if (!supabase) {
      const index = mockCollectors.findIndex(c => c.id === id)
      if (index === -1) throw new Error('Collector not found')
      
      mockCollectors[index] = { ...mockCollectors[index], ...updates }
      return mockCollectors[index]
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('collectors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update collector: ${error.message}`)
    }

    return data
  },

  // Generate unique collector code
  async generateCollectorCode(): Promise<string> {
    if (!supabase) {
      const lastCode = mockCollectors.length > 0 ? mockCollectors[0].collector_code : 'COL000'
      const num = parseInt(lastCode.substring(3)) + 1
      return `COL${num.toString().padStart(3, '0')}`
    }

    const { data, error } = await supabase
      .schema('lending1')
      .from('collectors')
      .select('collector_code')
      .order('collector_code', { ascending: false })
      .limit(1)

    if (error) {
      console.warn('Failed to fetch last collector code, using default format')
    }

    const lastCode = data?.[0]?.collector_code
    if (lastCode && lastCode.startsWith('COL')) {
      const num = parseInt(lastCode.substring(3)) + 1
      return `COL${num.toString().padStart(3, '0')}`
    }

    return 'COL001'
  },

  // Get collectors performance summary
  async getCollectorsPerformance() {
    if (!supabase) {
      return {
        totalCollectors: mockCollectors.length,
        activeCollectors: mockCollectors.filter(c => c.employment_status === 'Active').length,
        totalCommissions: 15250.00,
        averageCollectionRate: 92.5
      }
    }

    // This would need to join with payments table to get actual performance data
    const collectors = await this.getCollectors()
    
    return {
      totalCollectors: collectors.length,
      activeCollectors: collectors.filter(c => c.employment_status === 'Active').length,
      totalCommissions: 15250.00, // Mock data
      averageCollectionRate: 92.5 // Mock data
    }
  }
}