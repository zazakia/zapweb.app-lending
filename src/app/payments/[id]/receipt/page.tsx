'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/ProtectedRoute'
import LayoutSwitcher from '@/components/LayoutSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Download,
  FileText,
  DollarSign,
  CheckCircle,
  LogOut,
  Printer,
  Receipt,
  Building2
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { paymentService, Payment } from '@/lib/services/paymentService'

function PaymentReceiptContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const paymentId = params.id as string
  
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (paymentId) {
      loadPayment()
    }
  }, [paymentId])

  const loadPayment = async () => {
    try {
      setLoading(true)
      const paymentData = await paymentService.getPaymentById(paymentId)
      setPayment(paymentData)
    } catch (error) {
      console.error('Error loading payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!payment && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
            <p className="text-gray-600 mb-4">The requested payment receipt could not be found.</p>
            <Button onClick={() => router.push('/payments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
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
                onClick={() => router.push('/payments')}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Payments
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Payment Receipt</h1>
                <p className="text-lg text-cyan-200 font-semibold">Official payment acknowledgment</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-4">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Receipt Actions</h2>
              <p className="text-gray-600">Print or download the payment receipt</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading receipt...</p>
          </div>
        ) : payment ? (
          <div className="bg-white border-2 border-gray-300 shadow-lg print:shadow-none print:border-gray-800">
            {/* Receipt Header */}
            <div className="border-b-2 border-gray-300 print:border-gray-800 p-8 text-center bg-gradient-to-r from-indigo-50 to-purple-50 print:bg-white">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="h-12 w-12 text-indigo-600 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">MELANN LENDING INVESTOR CORP.</h1>
                  <p className="text-lg text-gray-600">OFFICIAL PAYMENT RECEIPT</p>
                </div>
              </div>
              <div className="bg-white border border-gray-300 inline-block px-6 py-2 rounded-lg print:border-gray-800">
                <p className="text-sm font-medium text-gray-700">Receipt No: <span className="font-bold text-indigo-600">{payment.payment_id}</span></p>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-8">
              {/* Payment Status */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-3 print:bg-white print:border-green-800">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">PAYMENT RECEIVED</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Customer Code:</span>
                      <p className="font-medium">{(payment as any).customers?.customer_code || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">
                        {(payment as any).customers?.first_name} {(payment as any).customers?.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Loan Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Loan Code:</span>
                      <p className="font-medium">{(payment as any).loans?.loan_code || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Principal Amount:</span>
                      <p className="font-medium">{formatCurrency((payment as any).loans?.principal_amount || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 print:bg-gray-50 print:border-gray-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-600">Payment Amount:</span>
                    <p className="text-3xl font-bold text-indigo-700">{formatCurrency(payment.payment_amount)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">New Balance:</span>
                    <p className="text-2xl font-semibold text-green-700">{formatCurrency(payment.new_balance)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <p className="font-medium">{payment.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Payment Date:</span>
                    <p className="font-medium">{formatDate(payment.payment_date)}</p>
                  </div>
                  {payment.reference_number && (
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-600">Reference Number:</span>
                      <p className="font-medium">{payment.reference_number}</p>
                    </div>
                  )}
                </div>

                {/* Late Payment Information */}
                {payment.is_late_payment && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg print:bg-white print:border-yellow-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-yellow-700 font-medium">Late Payment Penalty:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-yellow-600">Days Late:</span>
                        <p className="font-medium">{payment.days_late} days</p>
                      </div>
                      <div>
                        <span className="text-yellow-600">Late Fee:</span>
                        <p className="font-medium">{formatCurrency(payment.late_payment_fee)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Information */}
              <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium">Collected By:</span>
                    <p>{payment.collected_by || user?.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Transaction Time:</span>
                    <p>{formatTime(payment.created_at || '')}</p>
                  </div>
                </div>
                <hr className="my-4" />
                <p className="text-xs">This is an official receipt generated by MELANN LENDING INVESTOR CORP. system.</p>
                <p className="text-xs">Please keep this receipt for your records.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Payment receipt not available</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function PaymentReceiptPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <LayoutSwitcher>
        <PaymentReceiptContent />
      </LayoutSwitcher>
    </ProtectedRoute>
  )
}