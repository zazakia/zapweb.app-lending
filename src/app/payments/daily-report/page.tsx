'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ProtectedRoute from '@/components/ProtectedRoute'
import LayoutSwitcher from '@/components/LayoutSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Calendar,
  Download,
  FileText,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  LogOut,
  Printer
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { paymentService, Payment } from '@/lib/services/paymentService'
import DemoModeNotice from '@/components/DemoModeNotice'

interface DailyReport {
  date: string
  payments: Payment[]
  totalCollection: number
  totalTransactions: number
  latePayments: number
  latePaymentFees: number
}

function DailyReportContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDailyReport()
  }, [selectedDate])

  const loadDailyReport = async () => {
    try {
      setLoading(true)
      const reportData = await paymentService.getDailyCollectionReport(selectedDate)
      setReport(reportData)
    } catch (error) {
      console.error('Error loading daily report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!report) return

    const csvContent = [
      ['Payment ID', 'Customer', 'Loan Code', 'Amount', 'Method', 'Time', 'Late Payment', 'Late Fee'].join(','),
      ...report.payments.map(payment => [
        payment.payment_id,
        `"${(payment as any).customers?.first_name || ''} ${(payment as any).customers?.last_name || ''}"`,
        (payment as any).loans?.loan_code || '',
        payment.payment_amount,
        payment.payment_method,
        formatTime(payment.created_at || ''),
        payment.is_late_payment ? 'Yes' : 'No',
        payment.late_payment_fee || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-collection-report-${selectedDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                onClick={() => router.push('/payments')}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Payments
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Daily Collection Report</h1>
                <p className="text-lg text-cyan-200 font-semibold">Review and export daily payment collections</p>
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
            <div className="flex items-center gap-4">
              <div>
                <Label htmlFor="reportDate">Report Date</Label>
                <Input
                  id="reportDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              </div>
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
                onClick={handleExport}
                disabled={!report || report.payments.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Report Header */}
        <div className="text-center mb-8 print:mb-4">
          <h2 className="text-2xl font-bold text-gray-800 print:text-black">MELANN LENDING INVESTOR CORP.</h2>
          <h3 className="text-xl font-semibold text-gray-700 print:text-black">Daily Collection Report</h3>
          <p className="text-gray-600 print:text-black">Date: {formatDate(selectedDate)}</p>
          <p className="text-sm text-gray-500 print:text-black">Generated on: {formatDate(new Date().toISOString())} at {formatTime(new Date().toISOString())}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading report...</p>
          </div>
        ) : report ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:mb-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Collection</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(report.totalCollection)}</div>
                  <p className="text-xs text-blue-600 font-medium">Amount collected today</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Transactions</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{report.totalTransactions}</div>
                  <p className="text-xs text-green-600 font-medium">Payment transactions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Late Payments</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{report.latePayments}</div>
                  <p className="text-xs text-orange-600 font-medium">Overdue collections</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Late Fees</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">{formatCurrency(report.latePaymentFees)}</div>
                  <p className="text-xs text-red-600 font-medium">Penalty charges</p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Details */}
            <Card className="bg-white border-gray-200 shadow-lg print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Payment Details
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Individual payment transactions for {formatDate(selectedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm print:text-xs">
                      <thead>
                        <tr className="border-b bg-gray-50 print:bg-transparent">
                          <th className="text-left p-3 print:p-1">Time</th>
                          <th className="text-left p-3 print:p-1">Payment ID</th>
                          <th className="text-left p-3 print:p-1">Customer</th>
                          <th className="text-left p-3 print:p-1">Loan Code</th>
                          <th className="text-left p-3 print:p-1">Amount</th>
                          <th className="text-left p-3 print:p-1">Method</th>
                          <th className="text-left p-3 print:p-1">Status</th>
                          <th className="text-left p-3 print:p-1">Late Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.payments.map((payment, index) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="p-3 print:p-1">{formatTime(payment.created_at || '')}</td>
                            <td className="p-3 print:p-1 font-medium">{payment.payment_id}</td>
                            <td className="p-3 print:p-1">
                              {(payment as any).customers?.first_name} {(payment as any).customers?.last_name}
                              <br />
                              <span className="text-xs text-gray-500">
                                {(payment as any).customers?.customer_code}
                              </span>
                            </td>
                            <td className="p-3 print:p-1">{(payment as any).loans?.loan_code}</td>
                            <td className="p-3 print:p-1 font-medium">{formatCurrency(payment.payment_amount)}</td>
                            <td className="p-3 print:p-1">{payment.payment_method}</td>
                            <td className="p-3 print:p-1">
                              {payment.is_late_payment && (
                                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 print:bg-transparent print:border print:border-red-800">
                                  Late ({payment.days_late} days)
                                </span>
                              )}
                              {!payment.is_late_payment && (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 print:bg-transparent print:border print:border-green-800">
                                  On Time
                                </span>
                              )}
                            </td>
                            <td className="p-3 print:p-1">
                              {payment.late_payment_fee > 0 ? formatCurrency(payment.late_payment_fee) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 bg-gray-100 font-semibold print:bg-transparent">
                          <td colSpan={4} className="p-3 print:p-1 text-right">TOTAL:</td>
                          <td className="p-3 print:p-1">{formatCurrency(report.totalCollection)}</td>
                          <td className="p-3 print:p-1"></td>
                          <td className="p-3 print:p-1"></td>
                          <td className="p-3 print:p-1">{formatCurrency(report.latePaymentFees)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No payments collected on {formatDate(selectedDate)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Select a date to view the daily collection report</p>
          </div>
        )}

        {/* Footer for print */}
        <div className="hidden print:block mt-8 text-center text-xs text-gray-600">
          <hr className="mb-4" />
          <p>This report was generated by MELANN LENDING INVESTOR CORP. system</p>
          <p>Prepared by: {user?.fullName} ({user?.userLevel})</p>
        </div>
      </main>
    </div>
  )
}

export default function DailyReportPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <LayoutSwitcher>
        <DailyReportContent />
      </LayoutSwitcher>
    </ProtectedRoute>
  )
}