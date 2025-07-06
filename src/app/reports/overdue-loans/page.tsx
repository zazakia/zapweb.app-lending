'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProtectedRoute from '@/components/ProtectedRoute'
import LayoutSwitcher from '@/components/LayoutSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Download,
  Printer,
  AlertTriangle,
  Clock,
  Phone,
  DollarSign,
  User,
  Calendar,
  TrendingUp,
  LogOut,
  RefreshCw,
  Filter,
  Search,
  MapPin
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { loanService } from '@/lib/services/loanService'
import DemoModeNotice from '@/components/DemoModeNotice'

interface OverdueLoan {
  id: string
  loanCode: string
  customerCode: string
  customerName: string
  customerPhone: string
  customerAddress: string
  principalAmount: number
  currentBalance: number
  daysOverdue: number
  overdueAmount: number
  lastPaymentDate: string
  maturityDate: string
  collectorName: string
  loanType: string
  agingCategory: '1-30' | '31-60' | '61-90' | '90+'
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface OverdueStats {
  totalOverdueLoans: number
  totalOverdueAmount: number
  averageDaysOverdue: number
  collectionEfficiency: number
  aging1_30: { count: number; amount: number }
  aging31_60: { count: number; amount: number }
  aging61_90: { count: number; amount: number }
  aging90Plus: { count: number; amount: number }
}

function OverdueLoansReportContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('daysOverdue')
  
  const [overdueStats, setOverdueStats] = useState<OverdueStats>({
    totalOverdueLoans: 0,
    totalOverdueAmount: 0,
    averageDaysOverdue: 0,
    collectionEfficiency: 0,
    aging1_30: { count: 0, amount: 0 },
    aging31_60: { count: 0, amount: 0 },
    aging61_90: { count: 0, amount: 0 },
    aging90Plus: { count: 0, amount: 0 }
  })

  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([])

  useEffect(() => {
    loadOverdueData()
  }, [])

  const loadOverdueData = async () => {
    try {
      setLoading(true)
      
      // Mock data representing overdue loans
      const mockStats: OverdueStats = {
        totalOverdueLoans: 272,
        totalOverdueAmount: 1530000,
        averageDaysOverdue: 23,
        collectionEfficiency: 87.3,
        aging1_30: { count: 149, amount: 892000 },
        aging31_60: { count: 78, amount: 445000 },
        aging61_90: { count: 32, amount: 143000 },
        aging90Plus: { count: 13, amount: 50000 }
      }

      const mockOverdueLoans: OverdueLoan[] = [
        {
          id: '1',
          loanCode: 'ML-2024-0856',
          customerCode: 'CUS-2023-1245',
          customerName: 'Maria Santos Cruz',
          customerPhone: '09171234567',
          customerAddress: 'Barangay San Antonio, Quezon City',
          principalAmount: 15000,
          currentBalance: 12500,
          daysOverdue: 45,
          overdueAmount: 12500,
          lastPaymentDate: '2024-05-15',
          maturityDate: '2024-06-01',
          collectorName: 'Juan Dela Cruz',
          loanType: '2 Month Term',
          agingCategory: '31-60',
          riskLevel: 'Medium'
        },
        {
          id: '2',
          loanCode: 'ML-2024-0923',
          customerCode: 'CUS-2024-0089',
          customerName: 'Roberto Gonzales',
          customerPhone: '09281234567',
          customerAddress: 'Barangay Poblacion, Marikina City',
          principalAmount: 8000,
          currentBalance: 7200,
          daysOverdue: 15,
          overdueAmount: 7200,
          lastPaymentDate: '2024-06-10',
          maturityDate: '2024-06-15',
          collectorName: 'Ana Reyes',
          loanType: '1 Month Term',
          agingCategory: '1-30',
          riskLevel: 'Low'
        },
        {
          id: '3',
          loanCode: 'ML-2024-0756',
          customerCode: 'CUS-2023-0456',
          customerName: 'Elena Villanueva',
          customerPhone: '09391234567',
          customerAddress: 'Barangay Bagong Silang, Caloocan City',
          principalAmount: 25000,
          currentBalance: 22000,
          daysOverdue: 78,
          overdueAmount: 22000,
          lastPaymentDate: '2024-04-05',
          maturityDate: '2024-05-05',
          collectorName: 'Carlos Martinez',
          loanType: '3 Month Term',
          agingCategory: '61-90',
          riskLevel: 'High'
        },
        {
          id: '4',
          loanCode: 'ML-2024-0634',
          customerCode: 'CUS-2023-0789',
          customerName: 'Fernando Aquino',
          customerPhone: '09451234567',
          customerAddress: 'Barangay Santo Domingo, Las Piñas City',
          principalAmount: 12000,
          currentBalance: 11000,
          daysOverdue: 125,
          overdueAmount: 11000,
          lastPaymentDate: '2024-02-20',
          maturityDate: '2024-03-20',
          collectorName: 'Maria Garcia',
          loanType: '2 Month Term',
          agingCategory: '90+',
          riskLevel: 'Critical'
        },
        {
          id: '5',
          loanCode: 'ML-2024-0445',
          customerCode: 'CUS-2024-0123',
          customerName: 'Carmen Dela Torre',
          customerPhone: '09561234567',
          customerAddress: 'Barangay Central, Pasig City',
          principalAmount: 18000,
          currentBalance: 16500,
          daysOverdue: 8,
          overdueAmount: 16500,
          lastPaymentDate: '2024-06-20',
          maturityDate: '2024-06-25',
          collectorName: 'Pedro Santos',
          loanType: 'Emergency Loan',
          agingCategory: '1-30',
          riskLevel: 'Low'
        }
      ]

      setOverdueStats(mockStats)
      setOverdueLoans(mockOverdueLoans)
      
    } catch (error) {
      console.error('Error loading overdue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLoans = overdueLoans.filter(loan => {
    const matchesSearch = searchTerm === '' || 
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || loan.agingCategory === filterCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'daysOverdue':
        return b.daysOverdue - a.daysOverdue
      case 'amount':
        return b.overdueAmount - a.overdueAmount
      case 'customer':
        return a.customerName.localeCompare(b.customerName)
      default:
        return b.daysOverdue - a.daysOverdue
    }
  })

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const csvData = [
      ['Overdue Loans Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['Summary Statistics'],
      ['Total Overdue Loans:', overdueStats.totalOverdueLoans.toString()],
      ['Total Overdue Amount:', overdueStats.totalOverdueAmount.toString()],
      ['Average Days Overdue:', overdueStats.averageDaysOverdue.toString()],
      ['Collection Efficiency:', overdueStats.collectionEfficiency.toString() + '%'],
      [''],
      ['Overdue Loans Detail'],
      ['Loan Code', 'Customer Code', 'Customer Name', 'Phone', 'Principal', 'Current Balance', 'Days Overdue', 'Overdue Amount', 'Maturity Date', 'Last Payment', 'Collector', 'Risk Level'],
      ...filteredLoans.map(loan => [
        loan.loanCode,
        loan.customerCode,
        loan.customerName,
        loan.customerPhone,
        loan.principalAmount.toString(),
        loan.currentBalance.toString(),
        loan.daysOverdue.toString(),
        loan.overdueAmount.toString(),
        loan.maturityDate,
        loan.lastPaymentDate,
        loan.collectorName,
        loan.riskLevel
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `overdue-loans-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAgingColor = (category: string) => {
    switch (category) {
      case '1-30': return 'bg-yellow-100 text-yellow-800'
      case '31-60': return 'bg-orange-100 text-orange-800'
      case '61-90': return 'bg-red-100 text-red-800'
      case '90+': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Overdue Loans Report</h1>
                <p className="text-lg text-cyan-200 font-semibold">Past due analysis and collection priorities</p>
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search loans, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by aging" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="1-30">1-30 Days</SelectItem>
                  <SelectItem value="31-60">31-60 Days</SelectItem>
                  <SelectItem value="61-90">61-90 Days</SelectItem>
                  <SelectItem value="90+">90+ Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daysOverdue">Days Overdue</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="customer">Customer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={loadOverdueData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
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
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2"
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
          <h3 className="text-xl font-semibold text-gray-700 print:text-black">Overdue Loans Report</h3>
          <p className="text-gray-600 print:text-black">Generated on: {formatDate(new Date().toISOString())}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading overdue loans data...</p>
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:mb-4">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">Total Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">{overdueStats.totalOverdueLoans}</div>
                  <p className="text-xs text-red-600 font-medium">{formatCurrency(overdueStats.totalOverdueAmount)}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Avg Days Overdue</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">{overdueStats.averageDaysOverdue}</div>
                  <p className="text-xs text-orange-600 font-medium">Days past due</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Collection Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{overdueStats.collectionEfficiency}%</div>
                  <p className="text-xs text-green-600 font-medium">Efficiency rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg print:shadow-none print:border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Critical Cases</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{overdueStats.aging90Plus.count}</div>
                  <p className="text-xs text-blue-600 font-medium">90+ days overdue</p>
                </CardContent>
              </Card>
            </div>

            {/* Aging Analysis */}
            <Card className="bg-white border-gray-200 shadow-lg mb-8 print:shadow-none print:border print:mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Aging Analysis
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Distribution of overdue loans by aging periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800">1-30 Days</h4>
                    <p className="text-2xl font-bold text-yellow-700">{overdueStats.aging1_30.count}</p>
                    <p className="text-sm text-yellow-600">{formatCurrency(overdueStats.aging1_30.amount)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800">31-60 Days</h4>
                    <p className="text-2xl font-bold text-orange-700">{overdueStats.aging31_60.count}</p>
                    <p className="text-sm text-orange-600">{formatCurrency(overdueStats.aging31_60.amount)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800">61-90 Days</h4>
                    <p className="text-2xl font-bold text-red-700">{overdueStats.aging61_90.count}</p>
                    <p className="text-sm text-red-600">{formatCurrency(overdueStats.aging61_90.amount)}</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                    <h4 className="font-semibold text-red-900">90+ Days</h4>
                    <p className="text-2xl font-bold text-red-800">{overdueStats.aging90Plus.count}</p>
                    <p className="text-sm text-red-700">{formatCurrency(overdueStats.aging90Plus.amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Loans List */}
            <Card className="bg-white border-gray-200 shadow-lg print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <AlertTriangle className="h-5 w-5 text-indigo-600" />
                  Overdue Loans Detail
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Showing {filteredLoans.length} of {overdueStats.totalOverdueLoans} overdue loans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm print:text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50 print:bg-transparent">
                        <th className="text-left p-3 print:p-1">Loan Code</th>
                        <th className="text-left p-3 print:p-1">Customer</th>
                        <th className="text-left p-3 print:p-1">Contact</th>
                        <th className="text-left p-3 print:p-1">Current Balance</th>
                        <th className="text-left p-3 print:p-1">Days Overdue</th>
                        <th className="text-left p-3 print:p-1">Aging</th>
                        <th className="text-left p-3 print:p-1">Risk Level</th>
                        <th className="text-left p-3 print:p-1">Collector</th>
                        <th className="text-left p-3 print:p-1 print:hidden">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((loan) => (
                        <tr key={loan.id} className="border-b hover:bg-gray-50 print:hover:bg-transparent">
                          <td className="p-3 print:p-1 font-medium">{loan.loanCode}</td>
                          <td className="p-3 print:p-1">
                            <div>
                              <p className="font-medium">{loan.customerName}</p>
                              <p className="text-xs text-gray-500">{loan.customerCode}</p>
                            </div>
                          </td>
                          <td className="p-3 print:p-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs">{loan.customerPhone}</span>
                            </div>
                          </td>
                          <td className="p-3 print:p-1 font-medium">{formatCurrency(loan.currentBalance)}</td>
                          <td className="p-3 print:p-1">
                            <span className="font-bold text-red-600">{loan.daysOverdue}</span> days
                          </td>
                          <td className="p-3 print:p-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getAgingColor(loan.agingCategory)} print:bg-transparent print:border`}>
                              {loan.agingCategory} days
                            </span>
                          </td>
                          <td className="p-3 print:p-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(loan.riskLevel)} print:bg-transparent print:border`}>
                              {loan.riskLevel}
                            </span>
                          </td>
                          <td className="p-3 print:p-1">{loan.collectorName}</td>
                          <td className="p-3 print:p-1 print:hidden">
                            <Button size="sm" variant="outline" className="text-xs">
                              Contact
                            </Button>
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

export default function OverdueLoansReportPage() {
  return (
    <ProtectedRoute requiredLevel="Cashier">
      <OverdueLoansReportContent />
    </ProtectedRoute>
  )
}