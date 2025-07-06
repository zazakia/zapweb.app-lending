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
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  LogOut,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { loanService } from '@/lib/services/loanService'
import DemoModeNotice from '@/components/DemoModeNotice'

interface PortfolioStats {
  totalLoans: number
  totalPrincipal: number
  totalOutstanding: number
  averageLoanSize: number
  portfolioYield: number
  defaultRate: number
  collectionRate: number
}

interface LoanStatusDistribution {
  status: string
  count: number
  amount: number
  percentage: number
  color: string
}

interface LoanTypeAnalysis {
  loanType: string
  count: number
  totalAmount: number
  averageSize: number
  defaultRate: number
  profitability: number
}

function LoanPortfolioReportContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalLoans: 0,
    totalPrincipal: 0,
    totalOutstanding: 0,
    averageLoanSize: 0,
    portfolioYield: 0,
    defaultRate: 0,
    collectionRate: 0
  })

  const [statusDistribution, setStatusDistribution] = useState<LoanStatusDistribution[]>([])
  const [loanTypeAnalysis, setLoanTypeAnalysis] = useState<LoanTypeAnalysis[]>([])

  useEffect(() => {
    loadPortfolioData()
  }, [dateRange])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, you would call actual services
      // For now, using mock data that represents typical lending portfolio metrics
      
      const mockStats: PortfolioStats = {
        totalLoans: 1247,
        totalPrincipal: 8750000,
        totalOutstanding: 5420000,
        averageLoanSize: 7020,
        portfolioYield: 12.5,
        defaultRate: 3.2,
        collectionRate: 94.8
      }

      const mockStatusDistribution: LoanStatusDistribution[] = [
        { status: 'Good', count: 743, amount: 3890000, percentage: 59.6, color: 'bg-green-500' },
        { status: 'Past Due 1-30', count: 149, amount: 892000, percentage: 11.9, color: 'bg-yellow-500' },
        { status: 'Past Due 31-60', count: 78, amount: 445000, percentage: 6.3, color: 'bg-orange-500' },
        { status: 'Past Due 60+', count: 45, amount: 193000, percentage: 3.6, color: 'bg-red-500' },
        { status: 'Full Paid', count: 232, amount: 0, percentage: 18.6, color: 'bg-blue-500' }
      ]

      const mockLoanTypeAnalysis: LoanTypeAnalysis[] = [
        { loanType: '1 Month Term', count: 324, totalAmount: 1620000, averageSize: 5000, defaultRate: 2.1, profitability: 15.2 },
        { loanType: '2 Month Term', count: 298, totalAmount: 2086000, averageSize: 7000, defaultRate: 2.8, profitability: 13.8 },
        { loanType: '3 Month Term', count: 187, totalAmount: 1683000, averageSize: 9000, defaultRate: 3.5, profitability: 12.4 },
        { loanType: 'Emergency Loan', count: 156, totalAmount: 780000, averageSize: 5000, defaultRate: 4.2, profitability: 18.5 },
        { loanType: 'Special Term', count: 282, totalAmount: 2581000, averageSize: 9150, defaultRate: 3.8, profitability: 11.9 }
      ]

      setPortfolioStats(mockStats)
      setStatusDistribution(mockStatusDistribution)
      setLoanTypeAnalysis(mockLoanTypeAnalysis)
      
    } catch (error) {
      console.error('Error loading portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Generate CSV export
    const csvData = [
      ['Loan Portfolio Analysis Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      ['Date Range:', `${dateRange.startDate} to ${dateRange.endDate}`],
      [''],
      ['Portfolio Summary'],
      ['Metric', 'Value'],
      ['Total Loans', portfolioStats.totalLoans.toString()],
      ['Total Principal', portfolioStats.totalPrincipal.toString()],
      ['Total Outstanding', portfolioStats.totalOutstanding.toString()],
      ['Average Loan Size', portfolioStats.averageLoanSize.toString()],
      ['Portfolio Yield (%)', portfolioStats.portfolioYield.toString()],
      ['Default Rate (%)', portfolioStats.defaultRate.toString()],
      ['Collection Rate (%)', portfolioStats.collectionRate.toString()],
      [''],
      ['Status Distribution'],
      ['Status', 'Count', 'Amount', 'Percentage'],
      ...statusDistribution.map(item => [item.status, item.count.toString(), item.amount.toString(), item.percentage.toString()]),
      [''],
      ['Loan Type Analysis'],
      ['Loan Type', 'Count', 'Total Amount', 'Average Size', 'Default Rate (%)', 'Profitability (%)'],
      ...loanTypeAnalysis.map(item => [
        item.loanType, 
        item.count.toString(), 
        item.totalAmount.toString(), 
        item.averageSize.toString(), 
        item.defaultRate.toString(), 
        item.profitability.toString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `loan-portfolio-analysis-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    if (status.includes('Good')) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status.includes('Full Paid')) return <CheckCircle className="h-4 w-4 text-blue-600" />
    if (status.includes('Past Due')) return <AlertCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-gray-600" />
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Loan Portfolio Analysis</h1>
                <p className="text-lg text-cyan-200 font-semibold">Comprehensive portfolio performance analysis</p>
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={loadPortfolioData}
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
          <h3 className="text-xl font-semibold text-gray-700 print:text-black">Loan Portfolio Analysis Report</h3>
          <p className="text-gray-600 print:text-black">
            Period: {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
          </p>
          <p className="text-gray-600 print:text-black">Generated on: {formatDate(new Date().toISOString())}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading portfolio analysis...</p>
          </div>
        ) : (
          <>
            {/* Portfolio Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:mb-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Portfolio</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(portfolioStats.totalPrincipal)}</div>
                  <p className="text-xs text-blue-600 font-medium">{portfolioStats.totalLoans} loans</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Outstanding Balance</CardTitle>
                  <CreditCard className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(portfolioStats.totalOutstanding)}</div>
                  <p className="text-xs text-green-600 font-medium">62% of total portfolio</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Portfolio Yield</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{portfolioStats.portfolioYield}%</div>
                  <p className="text-xs text-orange-600 font-medium">Annual yield rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Default Rate</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">{portfolioStats.defaultRate}%</div>
                  <p className="text-xs text-red-600 font-medium">Below industry average</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <Card className="bg-white border-gray-200 shadow-lg mb-8 print:shadow-none print:border print:mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <PieChart className="h-5 w-5 text-indigo-600" />
                  Loan Status Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Breakdown of loans by current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg print:bg-white print:border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium text-gray-800">{item.status}</p>
                          <p className="text-sm text-gray-600">{item.count} loans</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{formatCurrency(item.amount)}</p>
                        <p className="text-sm text-gray-600">{item.percentage}% of portfolio</p>
                      </div>
                      <div className="w-3 h-12 rounded-full ml-4" style={{ backgroundColor: item.color.replace('bg-', '#') }}></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loan Type Analysis */}
            <Card className="bg-white border-gray-200 shadow-lg print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Loan Type Performance Analysis
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Performance metrics by loan type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm print:text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50 print:bg-transparent">
                        <th className="text-left p-3 print:p-1">Loan Type</th>
                        <th className="text-left p-3 print:p-1">Count</th>
                        <th className="text-left p-3 print:p-1">Total Amount</th>
                        <th className="text-left p-3 print:p-1">Avg. Size</th>
                        <th className="text-left p-3 print:p-1">Default Rate</th>
                        <th className="text-left p-3 print:p-1">Profitability</th>
                        <th className="text-left p-3 print:p-1">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanTypeAnalysis.map((type) => (
                        <tr key={type.loanType} className="border-b hover:bg-gray-50 print:hover:bg-transparent">
                          <td className="p-3 print:p-1 font-medium">{type.loanType}</td>
                          <td className="p-3 print:p-1">{type.count}</td>
                          <td className="p-3 print:p-1">{formatCurrency(type.totalAmount)}</td>
                          <td className="p-3 print:p-1">{formatCurrency(type.averageSize)}</td>
                          <td className="p-3 print:p-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${ 
                              type.defaultRate <= 3 ? 'bg-green-100 text-green-800' :
                              type.defaultRate <= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            } print:bg-transparent print:border`}>
                              {type.defaultRate}%
                            </span>
                          </td>
                          <td className="p-3 print:p-1">{type.profitability}%</td>
                          <td className="p-3 print:p-1">
                            {type.profitability >= 15 ? (
                              <span className="text-green-600 font-medium">Excellent</span>
                            ) : type.profitability >= 12 ? (
                              <span className="text-blue-600 font-medium">Good</span>
                            ) : (
                              <span className="text-orange-600 font-medium">Average</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer for print */}
        <div className="hidden print:block mt-8 text-center text-xs text-gray-600">
          <hr className="mb-4" />
          <p>This report was generated by MELANN LENDING INVESTOR CORP. system</p>
          <p>Prepared by: {user?.fullName} ({user?.userLevel}) on {formatDate(new Date().toISOString())}</p>
        </div>
      </main>
    </div>
  )
}

export default function LoanPortfolioReportPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <LoanPortfolioReportContent />
    </ProtectedRoute>
  )
}