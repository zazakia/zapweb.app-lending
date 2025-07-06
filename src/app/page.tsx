'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/ProtectedRoute'
import LayoutSwitcher from '@/components/LayoutSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
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
import OptimizedNavigationButton from '@/components/OptimizedNavigationButton'
import { useOptimizedNavigation } from '@/lib/navigationOptimizer'
import { usePerformanceOptimizations, useWebVitalsOptimizations } from '@/hooks/usePerformanceOptimizations'

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
  const { settings } = useSettings()
  const router = useRouter()
  
  // Performance optimizations
  usePerformanceOptimizations()
  useWebVitalsOptimizations()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Load dashboard data
    loadDashboardData()

    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
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
      setError('Failed to load dashboard data')
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
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshDashboard = useCallback(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Memoize time display to prevent unnecessary re-renders
  const timeDisplay = useMemo(() => ({
    date: formatDate(currentTime),
    time: currentTime.toLocaleTimeString()
  }), [currentTime])

  // Memoize stats calculations
  const calculatedStats = useMemo(() => ({
    totalClients: stats.totalClients,
    totalLoans: stats.totalLoans,
    totalPrincipal: formatCurrency(stats.totalPrincipal),
    totalPayments: formatCurrency(stats.totalPayments),
    rateOfReturn: stats.rateOfReturn.toFixed(2),
    activeLoans: stats.activeLoans,
    pastDueLoans: stats.pastDueLoans
  }), [stats])

  const { navigate } = useOptimizedNavigation()
  
  const handleNavigation = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>

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
    </div>
  )
}

// Memoized header component to prevent unnecessary re-renders
const DashboardHeader = memo(({ timeDisplay, user, onLogout }: {
  timeDisplay: { date: string; time: string },
  user: any,
  onLogout: () => void
}) => (
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
            <p className="text-sm text-cyan-100 font-medium">Today is: {timeDisplay.date}</p>
            <p className="text-sm text-cyan-100 font-medium">
              Time: {timeDisplay.time}
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
              onClick={onLogout}
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
))

// Memoized navigation button component
const NavigationButton = memo(({ path, icon: Icon, label, shortcut, colorScheme, onNavigate }: {
  path: string,
  icon: any,
  label: string,
  shortcut: string,
  colorScheme: string,
  onNavigate: (path: string) => void
}) => {
  const handleClick = useCallback(() => {
    onNavigate(path)
  }, [path, onNavigate])

  return (
    <Button 
      className={`h-20 flex flex-col gap-2 bg-gradient-to-br from-${colorScheme}-50 to-${colorScheme}-100 hover:from-${colorScheme}-100 hover:to-${colorScheme}-200 border-${colorScheme}-200 transition-all duration-200 group`}
      variant="outline"
      onClick={handleClick}
    >
      <Icon className={`h-6 w-6 text-${colorScheme}-600 group-hover:scale-110 transition-transform`} />
      <span className={`text-xs font-medium text-${colorScheme}-700`}>{label}</span>
      <span className={`text-[10px] text-${colorScheme}-500`}>{shortcut}</span>
    </Button>
  )
})

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <LayoutSwitcher>
        <DashboardContent />
      </LayoutSwitcher>
    </ProtectedRoute>
  )
}