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
  Building2
} from 'lucide-react'
import { generateCustomerCode } from '@/lib/utils'
import { customerService, Customer as CustomerType } from '@/lib/services/customerService'

// Use the Customer type from customerService
type Customer = CustomerType & {
  // Add any additional UI-specific properties if needed
}

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
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const customersData = searchTerm 
        ? await customerService.searchCustomers(searchTerm)
        : await customerService.getCustomers()
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
      // TODO: Show error toast/notification
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
      setShowForm(true)
    } catch (error) {
      console.error('Error generating customer code:', error)
    }
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Add user ID to created_by field
      const customerData = {
        ...formData,
        created_by: user?.username // You might want to use user ID instead
      } as Omit<Customer, 'id' | 'created_at' | 'updated_at'>

      if (formData.id) {
        // Update existing customer
        await customerService.updateCustomer(formData.id, customerData)
      } else {
        // Create new customer
        await customerService.createCustomer(customerData)
      }
      
      // Reset form and go back to list
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
      setShowForm(false)
      loadCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      // TODO: Show error toast/notification
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name} ${customer.customer_code}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Customers
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-purple-800">Customer Registration</h1>
                  <p className="text-sm text-gray-600">Add new customer with complete KYC information</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Welcome: {user?.fullName}</span>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSaveCustomer}>
            <div className="grid gap-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Basic customer details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="customerCode">Customer Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="customerCode"
                      value={formData.customer_code || ''}
                      onChange={(e) => setFormData({...formData, customer_code: e.target.value})}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="civilStatus">Civil Status</Label>
                    <Select value={formData.civilStatus} onValueChange={(value) => setFormData({...formData, civilStatus: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select civil status" />
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
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employer">Employer/Company</Label>
                    <Input
                      id="employer"
                      value={formData.employer}
                      onChange={(e) => setFormData({...formData, employer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({...formData, monthlyIncome: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="1000"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ID Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Valid ID Information
                  </CardTitle>
                  <CardDescription>Two valid government-issued IDs required</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary ID */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Primary ID</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="id1Type">ID Type <span className="text-red-500">*</span></Label>
                          <Select value={formData.id1Type} onValueChange={(value) => setFormData({...formData, id1Type: value})}>
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
                          <Label htmlFor="id1Number">ID Number <span className="text-red-500">*</span></Label>
                          <Input
                            id="id1Number"
                            value={formData.id1Number}
                            onChange={(e) => setFormData({...formData, id1Number: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="id1IssuedBy">Issued By</Label>
                          <Input
                            id="id1IssuedBy"
                            value={formData.id1IssuedBy}
                            onChange={(e) => setFormData({...formData, id1IssuedBy: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="id1ExpiryDate">Expiry Date</Label>
                          <Input
                            id="id1ExpiryDate"
                            type="date"
                            value={formData.id1ExpiryDate}
                            onChange={(e) => setFormData({...formData, id1ExpiryDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary ID */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Secondary ID</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="id2Type">ID Type</Label>
                          <Select value={formData.id2Type} onValueChange={(value) => setFormData({...formData, id2Type: value})}>
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
                          <Label htmlFor="id2Number">ID Number</Label>
                          <Input
                            id="id2Number"
                            value={formData.id2Number}
                            onChange={(e) => setFormData({...formData, id2Number: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="id2IssuedBy">Issued By</Label>
                          <Input
                            id="id2IssuedBy"
                            value={formData.id2IssuedBy}
                            onChange={(e) => setFormData({...formData, id2IssuedBy: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="id2ExpiryDate">Expiry Date</Label>
                          <Input
                            id="id2ExpiryDate"
                            type="date"
                            value={formData.id2ExpiryDate}
                            onChange={(e) => setFormData({...formData, id2ExpiryDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact & Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact & Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => setFormData({...formData, emergencyContactRelationship: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="collateralDescription">Collateral Description</Label>
                    <Input
                      id="collateralDescription"
                      value={formData.collateralDescription}
                      onChange={(e) => setFormData({...formData, collateralDescription: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="collateralValue">Collateral Value</Label>
                    <Input
                      id="collateralValue"
                      type="number"
                      value={formData.collateralValue}
                      onChange={(e) => setFormData({...formData, collateralValue: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanPurpose">Loan Purpose</Label>
                    <Input
                      id="loanPurpose"
                      value={formData.loanPurpose}
                      onChange={(e) => setFormData({...formData, loanPurpose: e.target.value})}
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
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Customer'}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-purple-800">Customer Management</h1>
                <p className="text-sm text-gray-600">Manage customer information and KYC data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome: {user?.fullName}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
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
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer List
            </CardTitle>
            <CardDescription>
              Total customers: {filteredCustomers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{customer.customerCode}</td>
                      <td className="p-3">
                        {customer.firstName} {customer.middleName} {customer.lastName}
                      </td>
                      <td className="p-3">{customer.phone}</td>
                      <td className="p-3">{customer.address}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer.creditScore >= 90 ? 'bg-green-100 text-green-800' :
                          customer.creditScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {customer.creditScore}
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
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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