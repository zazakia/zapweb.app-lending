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
  ArrowLeft, 
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  LogOut,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import DemoModeNotice from '@/components/DemoModeNotice'

interface MonthlyFinancials {
  month: string
  year: number
  revenue: {
    interestIncome: number
    serviceFeesIncome: number
    lateFeesIncome: number
    totalRevenue: number
  }
  expenses: {
    operationalExpenses: number
    salariesBenefits: number
    officeRent: number
    utilities: number
    marketingExpenses: number
    badDebtProvision: number
    totalExpenses: number
  }
  netIncome: number
  profitMargin: number
  totalLoansIssued: number
  totalPaymentsReceived: number
  outstandingPortfolio: number
  cashFlow: number
}

interface MonthlyComparison {
  currentMonth: MonthlyFinancials
  previousMonth: MonthlyFinancials
  yearToDate: {
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    averageProfitMargin: number
  }
}

function MonthlyFinancialReportContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const [financialData, setFinancialData] = useState<MonthlyComparison | null>(null)

  useEffect(() => {
    loadFinancialData()
  }, [selectedMonth, selectedYear])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      
      // Mock financial data
      const currentMonthData: MonthlyFinancials = {
        month: getMonthName(selectedMonth),
        year: selectedYear,
        revenue: {
          interestIncome: 1250000,
          serviceFeesIncome: 85000,
          lateFeesIncome: 45000,
          totalRevenue: 1380000
        },
        expenses: {
          operationalExpenses: 320000,
          salariesBenefits: 180000,
          officeRent: 45000,
          utilities: 12000,
          marketingExpenses: 25000,
          badDebtProvision: 65000,
          totalExpenses: 647000
        },
        netIncome: 733000,
        profitMargin: 53.1,
        totalLoansIssued: 2850000,
        totalPaymentsReceived: 1950000,
        outstandingPortfolio: 5420000,
        cashFlow: 685000
      }

      const previousMonthData: MonthlyFinancials = {
        month: getMonthName(selectedMonth - 1 || 12),
        year: selectedMonth === 1 ? selectedYear - 1 : selectedYear,
        revenue: {
          interestIncome: 1180000,
          serviceFeesIncome: 78000,
          lateFeesIncome: 38000,
          totalRevenue: 1296000
        },
        expenses: {
          operationalExpenses: 315000,
          salariesBenefits: 180000,
          officeRent: 45000,
          utilities: 11500,
          marketingExpenses: 20000,
          badDebtProvision: 58000,
          totalExpenses: 629500
        },
        netIncome: 666500,
        profitMargin: 51.4,
        totalLoansIssued: 2650000,
        totalPaymentsReceived: 1820000,
        outstandingPortfolio: 5280000,
        cashFlow: 625000
      }

      const mockData: MonthlyComparison = {
        currentMonth: currentMonthData,
        previousMonth: previousMonthData,
        yearToDate: {
          totalRevenue: 8950000,
          totalExpenses: 4250000,
          netIncome: 4700000,
          averageProfitMargin: 52.5
        }
      }

      setFinancialData(mockData)
      
    } catch (error) {
      console.error('Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || months[0]
  }

  const calculateChange = (current: number, previous: number): { percentage: number; direction: 'up' | 'down' | 'same' } => {
    if (previous === 0) return { percentage: 0, direction: 'same' }
    const change = ((current - previous) / previous) * 100
    return {
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    }
  }

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!financialData) return

    const { currentMonth, previousMonth, yearToDate } = financialData

    const csvData = [
      ['Monthly Financial Summary Report'],
      ['Company:', 'MELANN LENDING INVESTOR CORP.'],
      ['Period:', `${currentMonth.month} ${currentMonth.year}`],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['INCOME STATEMENT'],
      ['Revenue'],
      ['Interest Income', currentMonth.revenue.interestIncome.toString()],
      ['Service Fees Income', currentMonth.revenue.serviceFeesIncome.toString()],
      ['Late Fees Income', currentMonth.revenue.lateFeesIncome.toString()],
      ['Total Revenue', currentMonth.revenue.totalRevenue.toString()],
      [''],
      ['Expenses'],
      ['Operational Expenses', currentMonth.expenses.operationalExpenses.toString()],
      ['Salaries & Benefits', currentMonth.expenses.salariesBenefits.toString()],
      ['Office Rent', currentMonth.expenses.officeRent.toString()],
      ['Utilities', currentMonth.expenses.utilities.toString()],
      ['Marketing Expenses', currentMonth.expenses.marketingExpenses.toString()],
      ['Bad Debt Provision', currentMonth.expenses.badDebtProvision.toString()],
      ['Total Expenses', currentMonth.expenses.totalExpenses.toString()],
      [''],
      ['Net Income', currentMonth.netIncome.toString()],
      ['Profit Margin (%)', currentMonth.profitMargin.toString()],
      [''],
      ['KEY METRICS'],
      ['Total Loans Issued', currentMonth.totalLoansIssued.toString()],
      ['Total Payments Received', currentMonth.totalPaymentsReceived.toString()],
      ['Outstanding Portfolio', currentMonth.outstandingPortfolio.toString()],
      ['Cash Flow', currentMonth.cashFlow.toString()],
      [''],
      ['YEAR TO DATE'],
      ['YTD Total Revenue', yearToDate.totalRevenue.toString()],
      ['YTD Total Expenses', yearToDate.totalExpenses.toString()],
      ['YTD Net Income', yearToDate.netIncome.toString()],
      ['YTD Average Profit Margin (%)', yearToDate.averageProfitMargin.toString()]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `monthly-financial-summary-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
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
                onClick={() => router.push('/reports')}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Monthly Financial Summary</h1>
                <p className="text-lg text-cyan-200 font-semibold">Profit & loss and financial performance analysis</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={loadFinancialData}
                variant="outline"
                className="flex items-center gap-2 mt-6"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
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
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center gap-2"
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
          <h3 className="text-xl font-semibold text-gray-700 print:text-black">Monthly Financial Summary</h3>
          {financialData && (
            <p className="text-gray-600 print:text-black">
              Period: {financialData.currentMonth.month} {financialData.currentMonth.year}
            </p>
          )}
          <p className="text-gray-600 print:text-black">Generated on: {formatDate(new Date().toISOString())}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading financial data...</p>
          </div>
        ) : financialData ? (
          <>
            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:mb-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(financialData.currentMonth.revenue.totalRevenue)}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {(() => {
                      const change = calculateChange(
                        financialData.currentMonth.revenue.totalRevenue,
                        financialData.previousMonth.revenue.totalRevenue
                      )
                      return (
                        <>
                          {getChangeIcon(change.direction)}
                          <span className={getChangeColor(change.direction)}>
                            {change.percentage.toFixed(1)}% vs last month
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">
                    {formatCurrency(financialData.currentMonth.expenses.totalExpenses)}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {(() => {
                      const change = calculateChange(
                        financialData.currentMonth.expenses.totalExpenses,
                        financialData.previousMonth.expenses.totalExpenses
                      )
                      return (
                        <>
                          {getChangeIcon(change.direction)}
                          <span className={getChangeColor(change.direction)}>
                            {change.percentage.toFixed(1)}% vs last month
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Net Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(financialData.currentMonth.netIncome)}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {(() => {
                      const change = calculateChange(
                        financialData.currentMonth.netIncome,
                        financialData.previousMonth.netIncome
                      )
                      return (
                        <>
                          {getChangeIcon(change.direction)}
                          <span className={getChangeColor(change.direction)}>
                            {change.percentage.toFixed(1)}% vs last month
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Profit Margin</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {financialData.currentMonth.profitMargin.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {(() => {
                      const change = calculateChange(
                        financialData.currentMonth.profitMargin,
                        financialData.previousMonth.profitMargin
                      )
                      return (
                        <>
                          {getChangeIcon(change.direction)}
                          <span className={getChangeColor(change.direction)}>
                            {change.percentage.toFixed(1)}% vs last month
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Income Statement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 print:mb-4">
              {/* Revenue Breakdown */}
              <Card className="bg-white border-gray-200 shadow-lg print:shadow-none print:border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Revenue Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Sources of income for {financialData.currentMonth.month} {financialData.currentMonth.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-800">Interest Income</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(financialData.currentMonth.revenue.interestIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-800">Service Fees</span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(financialData.currentMonth.revenue.serviceFeesIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-orange-800">Late Fees</span>
                      <span className="font-bold text-orange-700">
                        {formatCurrency(financialData.currentMonth.revenue.lateFeesIncome)}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                      <span className="font-bold text-gray-800">Total Revenue</span>
                      <span className="font-bold text-gray-800 text-lg">
                        {formatCurrency(financialData.currentMonth.revenue.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expenses Breakdown */}
              <Card className="bg-white border-gray-200 shadow-lg print:shadow-none print:border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Expenses Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Operating expenses for {financialData.currentMonth.month} {financialData.currentMonth.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-800">Operational Expenses</span>
                      <span className="font-bold text-red-700">
                        {formatCurrency(financialData.currentMonth.expenses.operationalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-800">Salaries & Benefits</span>
                      <span className="font-bold text-purple-700">
                        {formatCurrency(financialData.currentMonth.expenses.salariesBenefits)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-orange-800">Bad Debt Provision</span>
                      <span className="font-bold text-orange-700">
                        {formatCurrency(financialData.currentMonth.expenses.badDebtProvision)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">Other Expenses</span>
                      <span className="font-bold text-gray-700">
                        {formatCurrency(
                          financialData.currentMonth.expenses.officeRent +
                          financialData.currentMonth.expenses.utilities +
                          financialData.currentMonth.expenses.marketingExpenses
                        )}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                      <span className="font-bold text-gray-800">Total Expenses</span>
                      <span className="font-bold text-gray-800 text-lg">
                        {formatCurrency(financialData.currentMonth.expenses.totalExpenses)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Year to Date Summary */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Year to Date Summary
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Cumulative financial performance for {financialData.currentMonth.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-800">YTD Revenue</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatCurrency(financialData.yearToDate.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-800">YTD Expenses</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatCurrency(financialData.yearToDate.totalExpenses)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-800">YTD Net Income</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatCurrency(financialData.yearToDate.netIncome)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-800">Avg Profit Margin</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {financialData.yearToDate.averageProfitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No financial data available for the selected period.</p>
          </div>
        )}

        {/* Footer for print */}
        <div className="hidden print:block mt-8 text-center text-xs text-gray-600">
          <hr className="mb-4" />
          <p>This report was generated by MELANN LENDING INVESTOR CORP. system</p>
          <p>Prepared by: {user?.fullName} ({user?.userLevel}) on {formatDate(new Date().toISOString())}</p>
          <p className="mt-2 font-semibold">CONFIDENTIAL - For Internal Use Only</p>
        </div>
      </main>
    </div>
  )
}

export default function MonthlyFinancialReportPage() {
  return (
    <ProtectedRoute requiredLevel="Admin">
      <MonthlyFinancialReportContent />
    </ProtectedRoute>
  )
}