import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Calendar,
  AlertCircle,
  BarChart3,
  Settings,
  UserCheck
} from 'lucide-react'

export default function QuickNavigation() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 print:hidden">
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
        <Button 
          className="h-20 flex flex-col gap-2 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200 transition-all duration-200 group" 
          variant="outline"
          onClick={() => router.push('/reports')}
        >
          <BarChart3 className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-amber-700">Reports</span>
          <span className="text-[10px] text-amber-500">Analytics</span>
        </Button>
        <Button 
          className="h-20 flex flex-col gap-2 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 transition-all duration-200 group" 
          variant="outline"
        >
          <AlertCircle className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-red-700">Past Due</span>
          <span className="text-[10px] text-red-500">Alerts</span>
        </Button>
      </div>

      {/* Admin Navigation */}
      {user?.userLevel === 'Admin' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-600" />
            Admin Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              className="h-16 flex flex-col gap-1 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/admin/loan-types')}
            >
              <Settings className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-indigo-700">Loan Types</span>
            </Button>
            <Button 
              className="h-16 flex flex-col gap-1 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/admin/collectors')}
            >
              <UserCheck className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-purple-700">Collectors</span>
            </Button>
            <Button 
              className="h-16 flex flex-col gap-1 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 transition-all duration-200 group" 
              variant="outline"
              onClick={() => router.push('/payments/daily-report')}
            >
              <FileText className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-green-700">Daily Report</span>
            </Button>
            <Button 
              className="h-16 flex flex-col gap-1 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200 transition-all duration-200 group" 
              variant="outline"
            >
              <Calendar className="h-5 w-5 text-gray-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-700">More Tools</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}