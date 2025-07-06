'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3,
  ArrowLeft,
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  PieChart,
  LogOut,
  Download,
  Eye,
  Target,
  CreditCard,
  Clock
} from 'lucide-react'
import DemoModeNotice from '@/components/DemoModeNotice'
import QuickNavigation from '@/components/QuickNavigation'

interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  category: 'financial' | 'operational' | 'customer' | 'compliance'
  gradient: string
  accessLevel: 'Cashier' | 'Admin'
}

const REPORTS: ReportCard[] = [
  {
    id: 'loan-portfolio',
    title: 'Loan Portfolio Analysis',
    description: 'Comprehensive analysis of loan portfolio performance and risk distribution',
    icon: <PieChart className="h-6 w-6" />,
    route: '/reports/loan-portfolio',
    category: 'financial',
    gradient: 'from-blue-50 to-blue-100 border-blue-200',
    accessLevel: 'Cashier'
  },
  {
    id: 'overdue-loans',
    title: 'Overdue Loans Report',
    description: 'Detailed report of past due loans with aging analysis and collection priorities',
    icon: <AlertTriangle className="h-6 w-6" />,
    route: '/reports/overdue-loans',
    category: 'operational',
    gradient: 'from-red-50 to-red-100 border-red-200',
    accessLevel: 'Cashier'
  },
  {
    id: 'monthly-financial',
    title: 'Monthly Financial Summary',
    description: 'Monthly profit & loss, cash flow, and financial performance metrics',
    icon: <TrendingUp className="h-6 w-6" />,
    route: '/reports/monthly-financial',
    category: 'financial',
    gradient: 'from-green-50 to-green-100 border-green-200',
    accessLevel: 'Admin'
  },
  {
    id: 'customer-analytics',
    title: 'Customer Analytics',
    description: 'Customer behavior analysis, retention rates, and demographic insights',
    icon: <Users className="h-6 w-6" />,
    route: '/reports/customer-analytics',
    category: 'customer',
    gradient: 'from-purple-50 to-purple-100 border-purple-200',
    accessLevel: 'Admin'
  },
  {
    id: 'collection-performance',
    title: 'Collection Performance',
    description: 'Collector performance metrics, efficiency analysis, and commission reports',
    icon: <Target className="h-6 w-6" />,
    route: '/reports/collection-performance',
    category: 'operational',
    gradient: 'from-orange-50 to-orange-100 border-orange-200',
    accessLevel: 'Admin'
  },
  {
    id: 'interest-income',
    title: 'Interest Income Analysis',
    description: 'Interest income tracking, rate analysis, and revenue projections',
    icon: <DollarSign className="h-6 w-6" />,
    route: '/reports/interest-income',
    category: 'financial',
    gradient: 'from-emerald-50 to-emerald-100 border-emerald-200',
    accessLevel: 'Admin'
  },
  {
    id: 'loan-approval',
    title: 'Loan Approval Statistics',
    description: 'Loan approval rates, rejection reasons, and processing time analysis',
    icon: <CreditCard className="h-6 w-6" />,
    route: '/reports/loan-approval',
    category: 'operational',
    gradient: 'from-indigo-50 to-indigo-100 border-indigo-200',
    accessLevel: 'Admin'
  },
  {
    id: 'aging-analysis',
    title: 'Aging Analysis',
    description: 'Account receivables aging with detailed breakdown by time periods',
    icon: <Clock className="h-6 w-6" />,
    route: '/reports/aging-analysis',
    category: 'compliance',
    gradient: 'from-amber-50 to-amber-100 border-amber-200',
    accessLevel: 'Cashier'
  }
]

function ReportsContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Reports', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'financial', name: 'Financial', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'operational', name: 'Operational', icon: <Target className="h-4 w-4" /> },
    { id: 'customer', name: 'Customer', icon: <Users className="h-4 w-4" /> },
    { id: 'compliance', name: 'Compliance', icon: <FileText className="h-4 w-4" /> }
  ]

  const filteredReports = REPORTS.filter(report => {
    const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory
    const accessMatch = user?.userLevel === 'Admin' || report.accessLevel === 'Cashier'
    return categoryMatch && accessMatch
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4 text-green-600" />
      case 'operational': return <Target className="h-4 w-4 text-orange-600" />
      case 'customer': return <Users className="h-4 w-4 text-purple-600" />
      case 'compliance': return <FileText className="h-4 w-4 text-blue-600" />
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
                <p className="text-lg text-cyan-200 font-semibold">Business intelligence and reporting dashboard</p>
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
        
        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Report Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className={`bg-gradient-to-br ${report.gradient} shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-white/50 group-hover:bg-white/70 transition-colors`}>
                      {report.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(report.category)}
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {report.category}
                      </span>
                    </div>
                  </div>
                  {report.accessLevel === 'Admin' && user?.userLevel !== 'Admin' && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      Admin Only
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {report.description}
                </CardDescription>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => router.push(report.route)}
                    className="flex-1 bg-white/70 hover:bg-white text-gray-800 border border-gray-300 hover:border-gray-400 transition-all duration-200"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white/70 hover:bg-white border-gray-300 hover:border-gray-400 transition-all duration-200"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reports Available</h3>
            <p className="text-gray-500">No reports match the selected criteria or your access level.</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Quick Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Available Reports</p>
                  <p className="text-2xl font-bold text-blue-700">{REPORTS.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Your Access Level</p>
                  <p className="text-lg font-bold text-green-700">{user?.userLevel}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-purple-700">4</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Accessible to You</p>
                  <p className="text-2xl font-bold text-orange-700">{filteredReports.length}</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <LayoutSwitcher>
        <ReportsContent />
      </LayoutSwitcher>
    </ProtectedRoute>
  )
}