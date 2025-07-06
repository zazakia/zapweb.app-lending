'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft, 
  Save,
  FileText,
  Phone,
  CreditCard,
  Building2,
  Edit,
  Trash2,
  LogOut
} from 'lucide-react'
import { customerService, Customer } from '@/lib/services/customerService'
import DemoModeNotice from '@/components/DemoModeNotice'
import QuickNavigation from '@/components/QuickNavigation'

const ID_TYPES = [
  'Driver\'s License',
  'Passport',
  'UMID',
  'SSS ID',
  'PhilHealth ID',
  'Postal ID',
  'Voter\'s ID',
  'Barangay ID',
  'Senior Citizen ID',
  'PWD ID',
  'TIN ID',
  'PRC ID'
]

const CIVIL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Separated'
]

const GENDER_OPTIONS = [
  'Male',
  'Female'
]

function CustomerManagementContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_code: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    civil_status: '',
    address: '',
    phone: '',
    email: '',
    occupation: '',
    employer: '',
    monthly_income: 0,
    id1_type: '',
    id1_number: '',
    id1_issued_by: '',
    id1_expiry_date: '',
    id2_type: '',
    id2_number: '',
    id2_issued_by: '',
    id2_expiry_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    collateral_description: '',
    collateral_value: 0,
    loan_purpose: '',
    credit_score: 100,
    late_payment_count: 0,
    late_payment_points: 0,
    status: 'Active'
  })

  useEffect(() => {
    loadCustomers()
  }, [searchTerm])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const customersData = searchTerm 
        ? await customerService.searchCustomers(searchTerm)
        : await customerService.getCustomers()
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    try {
      const customerCode = await customerService.generateCustomerCode()
      setFormData({
        customer_code: customerCode,
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        civil_status: '',
        address: '',
        phone: '',
        email: '',
        occupation: '',
        employer: '',
        monthly_income: 0,
        id1_type: '',
        id1_number: '',
        id1_issued_by: '',
        id1_expiry_date: '',
        id2_type: '',
        id2_number: '',
        id2_issued_by: '',
        id2_expiry_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        collateral_description: '',
        collateral_value: 0,
        loan_purpose: '',
        credit_score: 100,
        late_payment_count: 0,
        late_payment_points: 0,
        status: 'Active'
      })
      setEditingCustomer(null)
      setShowForm(true)
    } catch (error) {
      console.error('Error generating customer code:', error)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setFormData(customer)
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(id)
        loadCustomers()
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const customerData = {
        ...formData,
        created_by: user?.username
      } as Omit<Customer, 'id' | 'created_at' | 'updated_at'>

      if (editingCustomer?.id) {
        await customerService.updateCustomer(editingCustomer.id, customerData)
      } else {
        await customerService.createCustomer(customerData)
      }
      
      setFormData({
        customer_code: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        civil_status: '',
        address: '',
        phone: '',
        email: '',
        occupation: '',
        employer: '',
        monthly_income: 0,
        id1_type: '',
        id1_number: '',
        id1_issued_by: '',
        id1_expiry_date: '',
        id2_type: '',
        id2_number: '',
        id2_issued_by: '',
        id2_expiry_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        collateral_description: '',
        collateral_value: 0,
        loan_purpose: '',
        credit_score: 100,
        late_payment_count: 0,
        late_payment_points: 0,
        status: 'Active'
      })
      setEditingCustomer(null)
      setShowForm(false)
      loadCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Customers
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {editingCustomer ? 'Edit Customer' : 'Customer Registration'}
                  </h1>
                  <p className="text-lg text-cyan-200 font-semibold">
                    {editingCustomer ? 'Update customer information' : 'Add new customer with complete KYC information'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-cyan-200">Welcome</p>
                    <p className="font-semibold text-white">{user?.fullName}</p>
                    <p className="text-xs text-cyan-300">{user?.userLevel}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                    className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSaveCustomer}>
            <div className="grid gap-8">
              {/* Personal Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">Basic customer details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="customer_code">Customer Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="customer_code"
                      value={formData.customer_code || ''}
                      onChange={(e) => setFormData({...formData, customer_code: e.target.value})}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="first_name"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={formData.middle_name || ''}
                      onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="last_name"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender || ''} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select gender" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="civil_status">Civil Status</Label>
                    <Select value={formData.civil_status || ''} onValueChange={(value) => setFormData({...formData, civil_status: value})}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select civil status" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent>
                        {CIVIL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employer">Employer/Company</Label>
                    <Input
                      id="employer"
                      value={formData.employer || ''}
                      onChange={(e) => setFormData({...formData, employer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly_income">Monthly Income</Label>
                    <Input
                      id="monthly_income"
                      type="number"
                      value={formData.monthly_income || 0}
                      onChange={(e) => setFormData({...formData, monthly_income: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="1000"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ID Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Valid ID Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">Two valid government-issued IDs required</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary ID */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Primary ID</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="id1_type">ID Type <span className="text-red-500">*</span></Label>
                          <Select value={formData.id1_type || ''} onValueChange={(value) => setFormData({...formData, id1_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ID_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="id1_number">ID Number <span className="text-red-500">*</span></Label>
                          <Input
                            id="id1_number"
                            value={formData.id1_number || ''}
                            onChange={(e) => setFormData({...formData, id1_number: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="id1_issued_by">Issued By</Label>
                          <Input
                            id="id1_issued_by"
                            value={formData.id1_issued_by || ''}
                            onChange={(e) => setFormData({...formData, id1_issued_by: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="id1_expiry_date">Expiry Date</Label>
                          <Input
                            id="id1_expiry_date"
                            type="date"
                            value={formData.id1_expiry_date || ''}
                            onChange={(e) => setFormData({...formData, id1_expiry_date: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary ID */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Secondary ID</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="id2_type">ID Type</Label>
                          <Select value={formData.id2_type || ''} onValueChange={(value) => setFormData({...formData, id2_type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ID_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="id2_number">ID Number</Label>
                          <Input
                            id="id2_number"
                            value={formData.id2_number || ''}
                            onChange={(e) => setFormData({...formData, id2_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="id2_issued_by">Issued By</Label>
                          <Input
                            id="id2_issued_by"
                            value={formData.id2_issued_by || ''}
                            onChange={(e) => setFormData({...formData, id2_issued_by: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="id2_expiry_date">Expiry Date</Label>
                          <Input
                            id="id2_expiry_date"
                            type="date"
                            value={formData.id2_expiry_date || ''}
                            onChange={(e) => setFormData({...formData, id2_expiry_date: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact & Additional Info */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Phone className="h-5 w-5 text-indigo-600" />
                    Emergency Contact & Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name || ''}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone || ''}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                    <Input
                      id="emergency_contact_relationship"
                      value={formData.emergency_contact_relationship || ''}
                      onChange={(e) => setFormData({...formData, emergency_contact_relationship: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="collateral_description">Collateral Description</Label>
                    <Input
                      id="collateral_description"
                      value={formData.collateral_description || ''}
                      onChange={(e) => setFormData({...formData, collateral_description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="collateral_value">Collateral Value</Label>
                    <Input
                      id="collateral_value"
                      type="number"
                      value={formData.collateral_value || 0}
                      onChange={(e) => setFormData({...formData, collateral_value: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan_purpose">Loan Purpose</Label>
                    <Input
                      id="loan_purpose"
                      value={formData.loan_purpose || ''}
                      onChange={(e) => setFormData({...formData, loan_purpose: e.target.value})}
                      placeholder="Business capital, education, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Customer Management</h1>
                <p className="text-lg text-cyan-200 font-semibold">Manage customer information and KYC data</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-cyan-200">Welcome</p>
                  <p className="font-semibold text-white">{user?.fullName}</p>
                  <p className="text-xs text-cyan-300">{user?.userLevel}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                  className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoModeNotice />
        <QuickNavigation />
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddCustomer}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Customer List */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="h-5 w-5 text-indigo-600" />
              Customer List
            </CardTitle>
            <CardDescription className="text-slate-600">
              Total customers: {customers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading customers...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Customer Code</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Phone</th>
                      <th className="text-left p-3">Address</th>
                      <th className="text-left p-3">Credit Score</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{customer.customer_code}</td>
                        <td className="p-3">
                          {customer.first_name} {customer.middle_name} {customer.last_name}
                        </td>
                        <td className="p-3">{customer.phone}</td>
                        <td className="p-3">{customer.address}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            (customer.credit_score || 0) >= 90 ? 'bg-green-100 text-green-800' :
                            (customer.credit_score || 0) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {customer.credit_score || 0}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => customer.id && handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function CustomerManagementPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <CustomerManagementContent />
    </ProtectedRoute>
  )
}