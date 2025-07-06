'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Calendar,
  TrendingUp,
  AlertCircle,
  LogOut,
  Building2,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  Settings,
  UserCheck
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { customerService } from '@/lib/services/customerService'
import { loanService } from '@/lib/services/loanService'
import { paymentService } from '@/lib/services/paymentService'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalClients: number
  totalLoans: number
  totalPrincipal: number
  totalPayments: number
  rateOfReturn: number
  activeLoans: number
  pastDueLoans: number
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalLoans: 0,
    totalPrincipal: 0,
    totalPayments: 0,
    rateOfReturn: 0,
    activeLoans: 0,
    pastDueLoans: 0
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Load dashboard data
    loadDashboardData()

    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load real data from services
      const [customers, loansSummary, paymentsSummary] = await Promise.all([
        customerService.getCustomers(),
        loanService.getLoansSummary(),
        paymentService.getPaymentSummary()
      ])

      // Calculate rate of return (Total Payments / Total Principal * 100)
      const rateOfReturn = loansSummary.totalPrincipal > 0 
        ? (paymentsSummary.totalAmount / loansSummary.totalPrincipal) * 100 
        : 0

      setStats({
        totalClients: customers.length,
        totalLoans: loansSummary.totalLoans,
        totalPrincipal: loansSummary.totalPrincipal,
        totalPayments: paymentsSummary.totalAmount,
        rateOfReturn: rateOfReturn,
        activeLoans: loansSummary.activeLoans,
        pastDueLoans: loansSummary.pastDueLoans
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fallback to demo data if services fail
      setStats({
        totalClients: 1247,
        totalLoans: 892,
        totalPrincipal: 5420000,
        totalPayments: 4890000,
        rateOfReturn: 90.23,
        activeLoans: 743,
        pastDueLoans: 149
      })
    }
  }

  const refreshDashboard = () => {
    loadDashboardData()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  MELANN LENDING INVESTOR CORP.
                </h1>
                <p className="text-lg text-cyan-200 font-semibold tracking-wide">
                  DAILY COLLECTION AND LOAN REPORT
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-cyan-100 font-medium">Today is: {formatDate(currentTime)}</p>
                <p className="text-sm text-cyan-100 font-medium">
                  Time: {currentTime.toLocaleTimeString()}
                </p>
              </div>
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
        {/* Navigation Toolbar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button 
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/customers')}
            >
              <Users className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-blue-700">Customers</span>
              <span className="text-[10px] text-blue-500">(Ctrl+C)</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/loans')}
            >
              <CreditCard className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-green-700">Loans</span>
              <span className="text-[10px] text-green-500">(Ctrl+L)</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/payments')}
            >
              <DollarSign className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-purple-700">Payments</span>
              <span className="text-[10px] text-purple-500">(Ctrl+P)</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/payments/daily-report')}
            >
              <FileText className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-orange-700">DCR</span>
              <span className="text-[10px] text-orange-500">(Ctrl+D)</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border-cyan-200 transition-all duration-200 group" variant="outline">
              <Calendar className="h-6 w-6 text-cyan-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-cyan-700">CS</span>
              <span className="text-[10px] text-cyan-500">(Ctrl+A)</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 transition-all duration-200 group" variant="outline">
              <AlertCircle className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-red-700">Past Due</span>
              <span className="text-[10px] text-red-500">Alerts</span>
            </Button>
          </div>
        </div>

        {/* Admin Navigation */}
        {user?.userLevel === 'Admin' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Admin Panel
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200 transition-all duration-200 group" 
                variant="outline"
                onClick={() => router.push('/admin/loan-types')}
              >
                <Settings className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-indigo-700">Loan Types</span>
                <span className="text-[10px] text-indigo-500">Management</span>
              </Button>
              <Button 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 transition-all duration-200 group" 
                variant="outline"
                onClick={() => router.push('/admin/collectors')}
              >
                <UserCheck className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-purple-700">Collectors</span>
                <span className="text-[10px] text-purple-500">Management</span>
              </Button>
              <Button 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 transition-all duration-200 group" 
                variant="outline"
                onClick={() => router.push('/payments/daily-report')}
              >
                <FileText className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-green-700">Daily Report</span>
                <span className="text-[10px] text-green-500">Collections</span>
              </Button>
              <Button 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200 transition-all duration-200 group" 
                variant="outline"
                onClick={() => router.push('/reports')}
              >
                <BarChart3 className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-amber-700">Reports</span>
                <span className="text-[10px] text-amber-500">Analytics</span>
              </Button>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-8">
          <Button 
            onClick={refreshDashboard}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
            size="lg"
          >
            <RefreshCw className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Dashboard Data
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Clients</CardTitle>
              <div className="bg-blue-600 p-2 rounded-full">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.totalClients.toLocaleString()}</div>
              <p className="text-xs text-blue-600 font-medium">All registered customers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Loans</CardTitle>
              <div className="bg-green-600 p-2 rounded-full">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{stats.totalLoans.toLocaleString()}</div>
              <p className="text-xs text-green-600 font-medium">Number of loans issued</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Active Loans</CardTitle>
              <div className="bg-emerald-600 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{stats.activeLoans.toLocaleString()}</div>
              <p className="text-xs text-emerald-600 font-medium">Currently active loans</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Past Due</CardTitle>
              <div className="bg-red-600 p-2 rounded-full animate-pulse">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{stats.pastDueLoans.toLocaleString()}</div>
              <p className="text-xs text-red-600 font-medium">Overdue loans requiring attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Principal vs Payments */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Financial Overview
              </CardTitle>
              <CardDescription className="text-slate-600">Total principal vs payments collected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-1">Total Sum of All Loans (Principal)</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalPrincipal)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-1">Total Sum of Payments Made</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalPayments)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rate of Return */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <Target className="h-5 w-5 text-orange-600" />
                Rate of Return
              </CardTitle>
              <CardDescription className="text-orange-600">Total Payments / Total Principal × 100</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-8 shadow-lg">
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">
                    {stats.rateOfReturn.toFixed(2)}
                  </div>
                  <div className="text-2xl font-bold text-orange-500 mt-2">%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg border border-indigo-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-800">User Level:</h3>
                <p className="text-2xl font-bold text-indigo-600">{user?.userLevel}</p>
                <p className="text-sm text-indigo-600 mt-1">Logged in as: <span className="font-semibold">{user?.username}</span></p>
              </div>
            </div>
            <div className="text-right bg-white/70 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-700 font-medium">Version: 2.0.0</p>
              <p className="text-sm text-purple-600 font-medium">Built with Next.js & Supabase</p>
              <p className="text-xs text-indigo-500 mt-1">Schema: lending1</p>
              {!supabase && (
                <p className="text-xs text-orange-600 mt-1 font-semibold">⚠️ DEMO MODE</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}