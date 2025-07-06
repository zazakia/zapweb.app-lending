'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProtectedRoute from '@/components/ProtectedRoute'
import LayoutSwitcher from '@/components/LayoutSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { 
  CreditCard, 
  Plus, 
  Search, 
  ArrowLeft, 
  Save,
  FileText,
  Calculator,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  LogOut
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { loanService, Loan, LoanType } from '@/lib/services/loanService'
import { customerService, Customer } from '@/lib/services/customerService'
import DemoModeNotice from '@/components/DemoModeNotice'

function LoanManagementContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loans, setLoans] = useState<Loan[]>([])
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  
  const [formData, setFormData] = useState<Partial<Loan>>({
    loan_code: '',
    customer_id: '',
    loan_type_id: '',
    principal_amount: 0,
    interest_rate: 6.00,
    interest_amount: 0,
    total_amortization: 0,
    current_balance: 0,
    term_months: 1,
    term_days: 30,
    release_date: new Date().toISOString().split('T')[0],
    maturity_date: '',
    collector_id: '',
    branch_id: '',
    loan_status: 'Good',
    approval_status: 'Pending',
    disbursement_status: 'Pending',
    life_insurance: 0,
    service_fee: 0,
    loan_category: 'Regular'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadLoans()
  }, [searchTerm])

  // Recalculate when principal, rate, or loan type changes
  useEffect(() => {
    if (formData.principal_amount && formData.interest_rate) {
      const interest = loanService.calculateInterest(formData.principal_amount, formData.interest_rate)
      const total = loanService.calculateTotalAmortization(formData.principal_amount, interest)
      
      setFormData(prev => ({
        ...prev,
        interest_amount: interest,
        total_amortization: total,
        current_balance: total
      }))
    }
  }, [formData.principal_amount, formData.interest_rate])

  // Calculate maturity date when release date or term changes
  useEffect(() => {
    if (formData.release_date && formData.term_days) {
      const maturityDate = loanService.calculateMaturityDate(formData.release_date, formData.term_days)
      setFormData(prev => ({
        ...prev,
        maturity_date: maturityDate
      }))
    }
  }, [formData.release_date, formData.term_days])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [loanTypesData, customersData] = await Promise.all([
        loanService.getLoanTypes(),
        customerService.getCustomers()
      ])
      setLoanTypes(loanTypesData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLoans = async () => {
    try {
      setLoading(true)
      const loansData = searchTerm 
        ? await loanService.searchLoans(searchTerm)
        : await loanService.getLoans()
      setLoans(loansData)
    } catch (error) {
      console.error('Error loading loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLoan = async () => {
    try {
      const loanCode = await loanService.generateLoanCode()
      setFormData({
        loan_code: loanCode,
        customer_id: '',
        loan_type_id: '',
        principal_amount: 0,
        interest_rate: 6.00,
        interest_amount: 0,
        total_amortization: 0,
        current_balance: 0,
        term_months: 1,
        term_days: 30,
        release_date: new Date().toISOString().split('T')[0],
        maturity_date: '',
        collector_id: '',
        branch_id: '',
        loan_status: 'Good',
        approval_status: 'Pending',
        disbursement_status: 'Pending',
        life_insurance: 0,
        service_fee: 0,
        loan_category: 'Regular'
      })
      setEditingLoan(null)
      setShowForm(true)
    } catch (error) {
      console.error('Error generating loan code:', error)
    }
  }

  const handleEditLoan = (loan: Loan) => {
    setFormData(loan)
    setEditingLoan(loan)
    setShowForm(true)
  }

  const handleLoanTypeChange = (loanTypeId: string) => {
    const loanType = loanTypes.find(lt => lt.id === loanTypeId)
    if (loanType) {
      setFormData(prev => ({
        ...prev,
        loan_type_id: loanTypeId,
        interest_rate: loanType.interest_rate,
        term_months: loanType.term_months,
        term_days: loanType.term_days || 30
      }))
    }
  }

  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const loanData = {
        ...formData,
        created_by: user?.username,
        approved_by: user?.username
      } as Omit<Loan, 'id' | 'created_at' | 'updated_at'>

      let savedLoan: Loan
      if (editingLoan?.id) {
        savedLoan = await loanService.updateLoan(editingLoan.id, loanData)
      } else {
        savedLoan = await loanService.createLoan(loanData)
        
        // Create amortization schedule for new loan
        if (savedLoan.id) {
          await loanService.createAmortizationSchedule(savedLoan.id, savedLoan)
        }
      }
      
      // Reset form
      setFormData({
        loan_code: '',
        customer_id: '',
        loan_type_id: '',
        principal_amount: 0,
        interest_rate: 6.00,
        interest_amount: 0,
        total_amortization: 0,
        current_balance: 0,
        term_months: 1,
        term_days: 30,
        release_date: new Date().toISOString().split('T')[0],
        maturity_date: '',
        collector_id: '',
        branch_id: '',
        loan_status: 'Good',
        approval_status: 'Pending',
        disbursement_status: 'Pending',
        life_insurance: 0,
        service_fee: 0,
        loan_category: 'Regular'
      })
      setEditingLoan(null)
      setShowForm(false)
      loadLoans()
    } catch (error) {
      console.error('Error saving loan:', error)
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
                  Back to Loans
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {editingLoan ? 'Edit Loan' : 'Loan Application'}
                  </h1>
                  <p className="text-lg text-cyan-200 font-semibold">
                    {editingLoan ? 'Update loan information' : 'Process new loan application'}
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
          <form onSubmit={handleSaveLoan}>
            <div className="grid gap-8">
              {/* Loan Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Loan Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">Basic loan details and customer information</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="loan_code">Loan Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="loan_code"
                      value={formData.loan_code || ''}
                      onChange={(e) => setFormData({...formData, loan_code: e.target.value})}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_id">Customer <span className="text-red-500">*</span></Label>
                    <Select value={formData.customer_id || ''} onValueChange={(value) => setFormData({...formData, customer_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id!}>
                            {customer.customer_code} - {customer.first_name} {customer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="loan_type_id">Loan Type <span className="text-red-500">*</span></Label>
                    <Select value={formData.loan_type_id || ''} onValueChange={handleLoanTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {loanTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id!}>
                            {type.type_name} ({type.term_days} days, {type.interest_rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="loan_category">Loan Category</Label>
                    <Select value={formData.loan_category || ''} onValueChange={(value) => setFormData({...formData, loan_category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Restructured">Restructured</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="release_date">Release Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="release_date"
                      type="date"
                      value={formData.release_date || ''}
                      onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maturity_date">Maturity Date</Label>
                    <Input
                      id="maturity_date"
                      type="date"
                      value={formData.maturity_date || ''}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Details */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Calculator className="h-5 w-5 text-indigo-600" />
                    Financial Details
                  </CardTitle>
                  <CardDescription className="text-gray-600">Loan amounts and calculations</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="principal_amount">Principal Amount <span className="text-red-500">*</span></Label>
                    <Input
                      id="principal_amount"
                      type="number"
                      value={formData.principal_amount || 0}
                      onChange={(e) => setFormData({...formData, principal_amount: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      value={formData.interest_rate || 0}
                      onChange={(e) => setFormData({...formData, interest_rate: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest_amount">Interest Amount</Label>
                    <Input
                      id="interest_amount"
                      type="number"
                      value={formData.interest_amount || 0}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_amortization">Total Amortization</Label>
                    <Input
                      id="total_amortization"
                      type="number"
                      value={formData.total_amortization || 0}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_balance">Current Balance</Label>
                    <Input
                      id="current_balance"
                      type="number"
                      value={formData.current_balance || 0}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="term_days">Term (Days)</Label>
                    <Input
                      id="term_days"
                      type="number"
                      value={formData.term_days || 0}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="life_insurance">Life Insurance</Label>
                    <Input
                      id="life_insurance"
                      type="number"
                      value={formData.life_insurance || 0}
                      onChange={(e) => setFormData({...formData, life_insurance: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_fee">Service Fee</Label>
                    <Input
                      id="service_fee"
                      type="number"
                      value={formData.service_fee || 0}
                      onChange={(e) => setFormData({...formData, service_fee: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="approval_status">Approval Status</Label>
                    <Select value={formData.approval_status || 'Pending'} onValueChange={(value) => setFormData({...formData, approval_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select approval status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending Approval</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="loan_status">Loan Status</Label>
                    <Select value={formData.loan_status || ''} onValueChange={(value) => setFormData({...formData, loan_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Past Due">Past Due</SelectItem>
                        <SelectItem value="Full Paid">Full Paid</SelectItem>
                        <SelectItem value="Reversed">Reversed</SelectItem>
                        <SelectItem value="Restructured">Restructured</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {loading ? 'Saving...' : editingLoan ? 'Update Loan' : 'Create Loan'}
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Loan Management</h1>
                <p className="text-lg text-cyan-200 font-semibold">Process and manage loan applications</p>
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
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddLoan}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Loan
            </Button>
          </div>
        </div>

        {/* Loans List */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Loan Portfolio
            </CardTitle>
            <CardDescription className="text-slate-600">
              Total loans: {loans.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading loans...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="text-left p-3 font-semibold text-gray-900">Loan Code</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Customer</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Principal</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Balance</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Release Date</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Maturity Date</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Approval</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Disbursement</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">{loan.loan_code}</td>
                        <td className="p-3 text-gray-900">
                          {(loan as any).customers?.customer_code || 'N/A'}
                          <br />
                          <span className="text-xs text-gray-600">
                            {(loan as any).customers?.first_name} {(loan as any).customers?.last_name}
                          </span>
                        </td>
                        <td className="p-3 text-gray-900">{formatCurrency(loan.principal_amount)}</td>
                        <td className="p-3 text-gray-900">{formatCurrency(loan.current_balance)}</td>
                        <td className="p-3 text-gray-900">{formatDate(loan.release_date)}</td>
                        <td className="p-3 text-gray-900">{formatDate(loan.maturity_date)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loan.approval_status === 'Approved' ? 'bg-green-100 text-green-800' :
                            loan.approval_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            loan.approval_status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {loan.approval_status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loan.disbursement_status === 'Disbursed' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {loan.disbursement_status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loan.loan_status === 'Good' ? 'bg-green-100 text-green-800' :
                            loan.loan_status === 'Past Due' ? 'bg-red-100 text-red-800' :
                            loan.loan_status === 'Full Paid' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {loan.loan_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditLoan(loan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/loans/${loan.id}/schedule`)}
                              title="View Amortization Schedule"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loans.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-gray-500">
                          No loans found
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

export default function LoanManagementPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <LayoutSwitcher>
        <LoanManagementContent />
      </LayoutSwitcher>
    </ProtectedRoute>
  )
}