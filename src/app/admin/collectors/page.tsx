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
  Users, 
  Plus, 
  Search, 
  ArrowLeft, 
  Save,
  Phone,
  MapPin,
  Edit,
  Eye,
  LogOut,
  UserCheck,
  Percent,
  TrendingUp
} from 'lucide-react'
import { collectorService, Collector } from '@/lib/services/collectorService'
import { formatDate, formatCurrency } from '@/lib/utils'
import DemoModeNotice from '@/components/DemoModeNotice'

const ID_TYPES = [
  'Driver\'s License',
  'Passport',
  'UMID',
  'SSS ID',
  'PhilHealth ID',
  'Postal ID',
  'Voter\'s ID',
  'TIN ID',
  'PRC ID'
]

const EMPLOYMENT_STATUS_OPTIONS = [
  'Active',
  'Inactive',
  'Suspended',
  'Terminated'
]

function CollectorsManagementContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [collectors, setCollectors] = useState<Collector[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingCollector, setEditingCollector] = useState<Collector | null>(null)
  const [performanceStats, setPerformanceStats] = useState({
    totalCollectors: 0,
    activeCollectors: 0,
    totalCommissions: 0,
    averageCollectionRate: 0
  })
  
  const [formData, setFormData] = useState<Partial<Collector>>({
    collector_code: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    address: '',
    hire_date: new Date().toISOString().split('T')[0],
    employment_status: 'Active',
    assigned_area: '',
    commission_rate: 5.0,
    id_type: '',
    id_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    status: 'Active'
  })

  useEffect(() => {
    loadCollectors()
    loadPerformanceStats()
  }, [searchTerm])

  const loadCollectors = async () => {
    try {
      setLoading(true)
      const collectorsData = searchTerm 
        ? await collectorService.searchCollectors(searchTerm)
        : await collectorService.getCollectors()
      setCollectors(collectorsData)
    } catch (error) {
      console.error('Error loading collectors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPerformanceStats = async () => {
    try {
      const stats = await collectorService.getCollectorsPerformance()
      setPerformanceStats(stats)
    } catch (error) {
      console.error('Error loading performance stats:', error)
    }
  }

  const handleAddCollector = async () => {
    try {
      const collectorCode = await collectorService.generateCollectorCode()
      setFormData({
        collector_code: collectorCode,
        first_name: '',
        middle_name: '',
        last_name: '',
        contact_number: '',
        email: '',
        address: '',
        hire_date: new Date().toISOString().split('T')[0],
        employment_status: 'Active',
        assigned_area: '',
        commission_rate: 5.0,
        id_type: '',
        id_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        status: 'Active'
      })
      setEditingCollector(null)
      setShowForm(true)
    } catch (error) {
      console.error('Error generating collector code:', error)
    }
  }

  const handleEditCollector = (collector: Collector) => {
    setFormData(collector)
    setEditingCollector(collector)
    setShowForm(true)
  }

  const handleSaveCollector = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const collectorData = {
        ...formData,
        created_by: user?.username
      } as Omit<Collector, 'id' | 'created_at' | 'updated_at'>

      if (editingCollector?.id) {
        await collectorService.updateCollector(editingCollector.id, collectorData)
      } else {
        await collectorService.createCollector(collectorData)
      }
      
      setFormData({
        collector_code: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        contact_number: '',
        email: '',
        address: '',
        hire_date: new Date().toISOString().split('T')[0],
        employment_status: 'Active',
        assigned_area: '',
        commission_rate: 5.0,
        id_type: '',
        id_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        status: 'Active'
      })
      setEditingCollector(null)
      setShowForm(false)
      loadCollectors()
      loadPerformanceStats()
    } catch (error) {
      console.error('Error saving collector:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-900 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Collectors
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {editingCollector ? 'Edit Collector' : 'Add New Collector'}
                  </h1>
                  <p className="text-lg text-cyan-200 font-semibold">
                    {editingCollector ? 'Update collector information' : 'Register new field collector'}
                  </p>
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

        {/* Form */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSaveCollector}>
            <div className="grid gap-8">
              {/* Personal Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">Basic collector details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="collector_code">Collector Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="collector_code"
                      value={formData.collector_code || ''}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="first_name"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={formData.middle_name || ''}
                      onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="last_name"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number || ''}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      placeholder="09XXXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hire_date">Hire Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date || ''}
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <Select value={formData.employment_status || ''} onValueChange={(value) => setFormData({...formData, employment_status: value})}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assigned_area">Assigned Area</Label>
                    <Input
                      id="assigned_area"
                      value={formData.assigned_area || ''}
                      onChange={(e) => setFormData({...formData, assigned_area: e.target.value})}
                      placeholder="e.g., District 1, Quezon City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      value={formData.commission_rate || 0}
                      onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) || 0})}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ID Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Phone className="h-5 w-5 text-indigo-600" />
                    ID & Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="id_type">Valid ID Type <span className="text-red-500">*</span></Label>
                    <Select value={formData.id_type || ''} onValueChange={(value) => setFormData({...formData, id_type: value})}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ID_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="id_number">ID Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="id_number"
                      value={formData.id_number || ''}
                      onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name || ''}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone || ''}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : editingCollector ? 'Update Collector' : 'Save Collector'}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    )
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Collectors Management</h1>
                <p className="text-lg text-cyan-200 font-semibold">Manage field collectors and performance</p>
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

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Collectors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{performanceStats.totalCollectors}</div>
              <p className="text-xs text-blue-600 font-medium">Registered collectors</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Active Collectors</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{performanceStats.activeCollectors}</div>
              <p className="text-xs text-green-600 font-medium">Currently working</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Total Commissions</CardTitle>
              <Percent className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{formatCurrency(performanceStats.totalCommissions)}</div>
              <p className="text-xs text-purple-600 font-medium">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">{performanceStats.averageCollectionRate}%</div>
              <p className="text-xs text-orange-600 font-medium">Average success rate</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddCollector}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Collector
            </Button>
          </div>
        </div>

        {/* Collectors List */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="h-5 w-5 text-indigo-600" />
              Field Collectors
            </CardTitle>
            <CardDescription className="text-slate-600">
              Total collectors: {collectors.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading collectors...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Collector Code</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Contact</th>
                      <th className="text-left p-3">Assigned Area</th>
                      <th className="text-left p-3">Commission Rate</th>
                      <th className="text-left p-3">Employment Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectors.map((collector) => (
                      <tr key={collector.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{collector.collector_code}</td>
                        <td className="p-3">
                          {collector.first_name} {collector.middle_name} {collector.last_name}
                        </td>
                        <td className="p-3">{collector.contact_number}</td>
                        <td className="p-3">{collector.assigned_area || '-'}</td>
                        <td className="p-3">{collector.commission_rate}%</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            collector.employment_status === 'Active' ? 'bg-green-100 text-green-800' :
                            collector.employment_status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {collector.employment_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditCollector(collector)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {collectors.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          No collectors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function CollectorsManagementPage() {
  return (
    <ProtectedRoute requiredLevel="Admin">
      <CollectorsManagementContent />
    </ProtectedRoute>
  )
}