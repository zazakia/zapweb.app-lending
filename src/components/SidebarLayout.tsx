'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  FileText, 
  BarChart3,
  Settings,
  UserCheck,
  Building2,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Calendar,
  Home,
  Monitor,
  Sidebar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/', shortcut: 'Ctrl+H' },
    { id: 'customers', label: 'Customers', icon: Users, href: '/customers', shortcut: 'Ctrl+C' },
    { id: 'loans', label: 'Loans', icon: CreditCard, href: '/loans', shortcut: 'Ctrl+L' },
    { id: 'payments', label: 'Payments', icon: DollarSign, href: '/payments', shortcut: 'Ctrl+P' },
    { id: 'dcr', label: 'Daily Collection', icon: FileText, href: '/payments/daily-report', shortcut: 'Ctrl+D' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports', shortcut: 'Ctrl+R' },
    { id: 'past-due', label: 'Past Due', icon: AlertCircle, href: '/reports/overdue-loans', shortcut: 'Ctrl+A' },
  ]

  const adminItems = [
    { id: 'loan-types', label: 'Loan Types', icon: Settings, href: '/admin/loan-types' },
    { id: 'collectors', label: 'Collectors', icon: UserCheck, href: '/admin/collectors' },
    { id: 'reports-admin', label: 'Admin Reports', icon: Calendar, href: '/reports' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64'

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`${sidebarWidth} transition-all duration-300 bg-gradient-to-b from-indigo-900 via-purple-800 to-blue-900 shadow-xl flex flex-col fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-white">MELANN</h1>
                  <p className="text-xs text-cyan-200">Lending System</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex text-white hover:bg-white/10 p-1"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/10 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {/* Main Navigation */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-cyan-200 uppercase tracking-wider">
                    Main Menu
                  </h3>
                </div>
              )}
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-left ${
                      active 
                        ? 'bg-white/20 text-white border-r-2 border-cyan-300' 
                        : 'text-cyan-100 hover:bg-white/10 hover:text-white'
                    } ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                    onClick={() => {
                      router.push(item.href)
                      setMobileSidebarOpen(false)
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <span className="text-xs text-cyan-300">{item.shortcut}</span>
                      </>
                    )}
                  </Button>
                )
              })}
            </div>

            {/* Admin Navigation */}
            {user?.userLevel === 'Admin' && (
              <div className="space-y-1 pt-4">
                {!sidebarCollapsed && (
                  <div className="px-3 py-2 border-t border-white/10">
                    <h3 className="text-xs font-semibold text-cyan-200 uppercase tracking-wider">
                      Admin Tools
                    </h3>
                  </div>
                )}
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start text-left ${
                        active 
                          ? 'bg-white/20 text-white border-r-2 border-cyan-300' 
                          : 'text-cyan-100 hover:bg-white/10 hover:text-white'
                      } ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                      onClick={() => {
                        router.push(item.href)
                        setMobileSidebarOpen(false)
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                      {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                    </Button>
                  )
                })}
              </div>
            )}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                  <p className="text-xs text-cyan-200">{user?.userLevel}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1 text-cyan-100 hover:bg-white/10 hover:text-white"
                  title="Switch to Dashboard Theme"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Theme
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex-1 text-cyan-100 hover:bg-red-500/20 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full text-cyan-100 hover:bg-white/10 hover:text-white p-2"
                title="Switch to Dashboard Theme"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full text-cyan-100 hover:bg-red-500/20 hover:text-white p-2"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="hidden lg:flex items-center gap-2"
            >
              <Sidebar className="h-4 w-4" />
              Switch to Dashboard
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.userLevel}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}