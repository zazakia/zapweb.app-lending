'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Calendar,
  Download,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  Printer,
  CreditCard
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { loanService, Loan, AmortizationSchedule } from '@/lib/services/loanService'
import DemoModeNotice from '@/components/DemoModeNotice'

function AmortizationScheduleContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string
  
  const [loan, setLoan] = useState<Loan | null>(null)
  const [schedule, setSchedule] = useState<AmortizationSchedule[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loanId) {
      loadLoanAndSchedule()
    }
  }, [loanId])

  const loadLoanAndSchedule = async () => {
    try {
      setLoading(true)
      const [loanData, scheduleData] = await Promise.all([
        loanService.getLoanById(loanId),
        loanService.getAmortizationSchedule(loanId)
      ])
      
      setLoan(loanData)
      setSchedule(scheduleData)
    } catch (error) {
      console.error('Error loading loan and schedule:', error)
      // Create mock schedule if service fails
      if (!loan) return
      
      const mockSchedule: AmortizationSchedule[] = [{
        id: '1',
        loan_id: loanId,
        payment_number: 1,
        due_date: loan?.maturity_date || '',
        principal_amount: loan?.principal_amount || 0,
        interest_amount: loan?.interest_amount || 0,
        total_payment: loan?.total_amortization || 0,
        remaining_balance: 0,
        payment_status: loan?.loan_status === 'Full Paid' ? 'Paid' : 'Pending'
      }]
      setSchedule(mockSchedule)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // This would typically generate a PDF
    alert('PDF export functionality would be implemented here')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'Overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!loan && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loan Not Found</h2>
            <p className="text-gray-600 mb-4">The requested loan could not be found.</p>
            <Button onClick={() => router.push('/loans')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Loans
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 shadow-xl print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/loans')}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Loans
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Amortization Schedule</h1>
                <p className="text-lg text-cyan-200 font-semibold">Loan payment schedule and details</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-4">
        <DemoModeNotice />
        
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Schedule Actions</h2>
              <p className="text-gray-600">Print or export the amortization schedule</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button 
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Document Header */}
        <div className="text-center mb-8 print:mb-4">
          <h2 className="text-2xl font-bold text-gray-800 print:text-black">MELANN LENDING INVESTOR CORP.</h2>
          <h3 className="text-xl font-semibold text-gray-700 print:text-black">Amortization Schedule</h3>
          {loan && (
            <>
              <p className="text-gray-600 print:text-black">Loan Code: {loan.loan_code}</p>
              <p className="text-gray-600 print:text-black">Customer: {(loan as any).customers?.first_name} {(loan as any).customers?.last_name}</p>
            </>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading schedule...</p>
          </div>
        ) : loan ? (
          <>
            {/* Loan Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:mb-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Principal Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(loan.principal_amount)}</div>
                  <p className="text-xs text-blue-600 font-medium">Original loan amount</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Interest Amount</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(loan.interest_amount)}</div>
                  <p className="text-xs text-green-600 font-medium">Total interest ({loan.interest_rate}%)</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Total Amortization</CardTitle>
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(loan.total_amortization)}</div>
                  <p className="text-xs text-purple-600 font-medium">Principal + Interest</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Current Balance</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{formatCurrency(loan.current_balance)}</div>
                  <p className="text-xs text-orange-600 font-medium">Remaining balance</p>
                </CardContent>
              </Card>
            </div>

            {/* Loan Details */}
            <Card className="bg-white border-gray-200 shadow-lg mb-8 print:shadow-none print:border print:mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Loan Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="font-medium text-gray-700">Release Date:</Label>
                  <p className="text-gray-900">{formatDate(loan.release_date)}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Maturity Date:</Label>
                  <p className="text-gray-900">{formatDate(loan.maturity_date)}</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Term:</Label>
                  <p className="text-gray-900">{loan.term_days} days</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Interest Rate:</Label>
                  <p className="text-gray-900">{loan.interest_rate}%</p>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Loan Status:</Label>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.loan_status === 'Good' ? 'bg-green-100 text-green-800' :
                    loan.loan_status === 'Past Due' ? 'bg-red-100 text-red-800' :
                    loan.loan_status === 'Full Paid' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  } print:bg-transparent print:border`}>
                    {loan.loan_status}
                  </span>
                </div>
                <div>
                  <Label className="font-medium text-gray-700">Category:</Label>
                  <p className="text-gray-900">{loan.loan_category}</p>
                </div>
              </CardContent>
            </Card>

            {/* Amortization Schedule */}
            <Card className="bg-white border-gray-200 shadow-lg print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Payment Schedule
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Detailed payment breakdown and schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm print:text-xs">
                      <thead>
                        <tr className="border-b bg-gray-50 print:bg-transparent">
                          <th className="text-left p-3 print:p-1">Payment #</th>
                          <th className="text-left p-3 print:p-1">Due Date</th>
                          <th className="text-left p-3 print:p-1">Principal</th>
                          <th className="text-left p-3 print:p-1">Interest</th>
                          <th className="text-left p-3 print:p-1">Total Payment</th>
                          <th className="text-left p-3 print:p-1">Remaining Balance</th>
                          <th className="text-left p-3 print:p-1">Status</th>
                          <th className="text-left p-3 print:p-1 print:hidden">Paid Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="p-3 print:p-1 font-medium">{payment.payment_number}</td>
                            <td className="p-3 print:p-1">{formatDate(payment.due_date)}</td>
                            <td className="p-3 print:p-1">{formatCurrency(payment.principal_amount)}</td>
                            <td className="p-3 print:p-1">{formatCurrency(payment.interest_amount)}</td>
                            <td className="p-3 print:p-1 font-medium">{formatCurrency(payment.total_payment)}</td>
                            <td className="p-3 print:p-1">{formatCurrency(payment.remaining_balance)}</td>
                            <td className="p-3 print:p-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(payment.payment_status)}
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.payment_status)} print:bg-transparent print:border`}>
                                  {payment.payment_status}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 print:p-1 print:hidden">
                              {payment.actual_payment_date ? formatDate(payment.actual_payment_date) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No payment schedule available for this loan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Loan information not found</p>
          </div>
        )}

        {/* Footer for print */}
        <div className="hidden print:block mt-8 text-center text-xs text-gray-600">
          <hr className="mb-4" />
          <p>This schedule was generated by MELANN LENDING INVESTOR CORP. system</p>
          <p>Prepared by: {user?.fullName} ({user?.userLevel}) on {formatDate(new Date().toISOString())}</p>
        </div>
      </main>
    </div>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-sm font-medium ${className}`}>{children}</span>
}

export default function AmortizationSchedulePage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <AmortizationScheduleContent />
    </ProtectedRoute>
  )
}