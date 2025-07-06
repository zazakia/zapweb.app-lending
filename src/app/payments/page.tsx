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
  DollarSign, 
  Plus, 
  Search, 
  ArrowLeft, 
  Save,
  Receipt,
  AlertTriangle,
  Undo,
  Eye,
  Calendar,
  LogOut
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentService, Payment } from '@/lib/services/paymentService'
import { loanService, Loan } from '@/lib/services/loanService'
import { customerService, Customer } from '@/lib/services/customerService'
import DemoModeNotice from '@/components/DemoModeNotice'
import QuickNavigation from '@/components/QuickNavigation'

function PaymentManagementContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  
  const [formData, setFormData] = useState({
    loanId: '',
    customerId: '',
    paymentAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: '',
    collectorId: '',
    collectedBy: user?.username || ''
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadPayments()
  }, [searchTerm])

  // Update customer when loan is selected
  useEffect(() => {
    if (formData.loanId) {
      const loan = loans.find(l => l.id === formData.loanId)
      if (loan) {
        setSelectedLoan(loan)
        setFormData(prev => ({
          ...prev,
          customerId: loan.customer_id,
          paymentAmount: loan.current_balance // Default to full balance
        }))
      }
    }
  }, [formData.loanId, loans])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [loansData, customersData] = await Promise.all([
        loanService.getLoans(),
        customerService.getCustomers()
      ])
      // Filter to only active loans with balance
      setLoans(loansData.filter(loan => 
        loan.loan_status !== 'Full Paid' && 
        loan.current_balance > 0
      ))
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      setLoading(true)
      const paymentsData = searchTerm 
        ? await paymentService.searchPayments(searchTerm)
        : await paymentService.getPayments()
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = () => {
    setFormData({
      loanId: '',
      customerId: '',
      paymentAmount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      referenceNumber: '',
      collectorId: '',
      collectedBy: user?.username || ''
    })
    setSelectedLoan(null)
    setShowForm(true)
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await paymentService.processPayment({
        loanId: formData.loanId,
        customerId: formData.customerId,
        paymentAmount: formData.paymentAmount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        collectorId: formData.collectorId,
        collectedBy: formData.collectedBy
      })
      
      // Reset form
      setFormData({
        loanId: '',
        customerId: '',
        paymentAmount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        referenceNumber: '',
        collectorId: '',
        collectedBy: user?.username || ''
      })
      setSelectedLoan(null)
      setShowForm(false)
      loadPayments()
      loadInitialData() // Reload to update loan balances
    } catch (error) {
      console.error('Error processing payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReversePayment = async (paymentId: string) => {
    const reason = prompt('Please enter reason for reversal:')
    if (reason && confirm('Are you sure you want to reverse this payment?')) {
      try {
        await paymentService.reversePayment(paymentId, reason, user?.username || '')
        loadPayments()
        loadInitialData()
      } catch (error) {
        console.error('Error reversing payment:', error)
      }
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
                  Back to Payments
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Payment Collection</h1>
                  <p className="text-lg text-cyan-200 font-semibold">Process customer payment</p>
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleProcessPayment}>
            <div className="grid gap-8">
              {/* Payment Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    Payment Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">Select loan and enter payment details</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanId">Select Loan <span className="text-red-500">*</span></Label>
                    <Select value={formData.loanId} onValueChange={(value) => setFormData({...formData, loanId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan to pay" />
                      </SelectTrigger>
                      <SelectContent>
                        {loans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id!}>
                            {loan.loan_code} - {(loan as any).customers?.customer_code} 
                            ({formatCurrency(loan.current_balance)} balance)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Payment Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentAmount">Payment Amount <span className="text-red-500">*</span></Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={formData.paymentAmount}
                      onChange={(e) => setFormData({...formData, paymentAmount: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                      placeholder="Check number, transfer ID, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Loan Details */}
              {selectedLoan && (
                <Card className="bg-white border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Receipt className="h-5 w-5 text-indigo-600" />
                      Loan Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Customer</Label>
                      <p className="font-medium">
                        {(selectedLoan as any).customers?.customer_code} - 
                        {(selectedLoan as any).customers?.first_name} {(selectedLoan as any).customers?.last_name}
                      </p>
                    </div>
                    <div>
                      <Label>Loan Type</Label>
                      <p className="font-medium">{(selectedLoan as any).loan_types?.type_name}</p>
                    </div>
                    <div>
                      <Label>Principal Amount</Label>
                      <p className="font-medium">{formatCurrency(selectedLoan.principal_amount)}</p>
                    </div>
                    <div>
                      <Label>Current Balance</Label>
                      <p className="font-medium text-red-600">{formatCurrency(selectedLoan.current_balance)}</p>
                    </div>
                    <div>
                      <Label>Release Date</Label>
                      <p className="font-medium">{formatDate(selectedLoan.release_date)}</p>
                    </div>
                    <div>
                      <Label>Maturity Date</Label>
                      <p className="font-medium">{formatDate(selectedLoan.maturity_date)}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedLoan.loan_status === 'Good' ? 'bg-green-100 text-green-800' :
                        selectedLoan.loan_status === 'Past Due' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLoan.loan_status}
                      </span>
                    </div>
                    <div>
                      <Label>New Balance</Label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(Math.max(0, selectedLoan.current_balance - formData.paymentAmount))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.loanId || formData.paymentAmount <= 0} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Process Payment'}
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Payment Management</h1>
                <p className="text-lg text-cyan-200 font-semibold">Process and track loan payments</p>
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
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push('/payments/daily-report')}
                className="flex items-center gap-2 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 transition-all duration-200 group"
              >
                <Calendar className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-orange-700 font-medium">Daily Report</span>
              </Button>
            </div>
            <Button 
              onClick={handleAddPayment}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Payments List */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Payment History
            </CardTitle>
            <CardDescription className="text-slate-600">
              Total payments: {payments.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading payments...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Payment ID</th>
                      <th className="text-left p-3">Loan Code</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Payment Date</th>
                      <th className="text-left p-3">Method</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{payment.payment_id}</td>
                        <td className="p-3">{(payment as any).loans?.loan_code || 'N/A'}</td>
                        <td className="p-3">
                          {(payment as any).customers?.customer_code || 'N/A'}
                          <br />
                          <span className="text-xs text-gray-500">
                            {(payment as any).customers?.first_name} {(payment as any).customers?.last_name}
                          </span>
                        </td>
                        <td className="p-3">
                          {formatCurrency(payment.payment_amount)}
                          {payment.is_late_payment && (
                            <div className="flex items-center gap-1 text-red-600 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              Late ({payment.days_late} days)
                            </div>
                          )}
                        </td>
                        <td className="p-3">{formatDate(payment.payment_date)}</td>
                        <td className="p-3">{payment.payment_method}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payment.payment_status === 'Active' ? 'bg-green-100 text-green-800' :
                            payment.payment_status === 'Reversed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.payment_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/payments/${payment.id}/receipt`)}
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.payment_status === 'Active' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => payment.id && handleReversePayment(payment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Undo className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500">
                          No payments found
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

export default function PaymentManagementPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <PaymentManagementContent />
    </ProtectedRoute>
  )
}