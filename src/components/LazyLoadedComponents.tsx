import { lazy, Suspense } from 'react'
import { RefreshCw } from 'lucide-react'

// Lazy load heavy components
export const LazyCustomerPage = lazy(() => import('@/app/customers/page'))
export const LazyLoanPage = lazy(() => import('@/app/loans/page'))
export const LazyPaymentPage = lazy(() => import('@/app/payments/page'))
export const LazyAdminPage = lazy(() => import('@/app/admin/loan-types/page'))

// Loading component
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center bg-white rounded-lg shadow-lg p-8">
      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
)

// Wrapper components with Suspense
export const CustomerPageWrapper = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Customer Management..." />}>
    <LazyCustomerPage />
  </Suspense>
)

export const LoanPageWrapper = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Loan Management..." />}>
    <LazyLoanPage />
  </Suspense>
)

export const PaymentPageWrapper = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Payment Management..." />}>
    <LazyPaymentPage />
  </Suspense>
)

export const AdminPageWrapper = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Admin Panel..." />}>
    <LazyAdminPage />
  </Suspense>
)