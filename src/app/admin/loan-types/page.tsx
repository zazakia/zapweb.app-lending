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
  Plus,
  Save,
  Edit,
  Trash2,
  Settings,
  CreditCard,
  LogOut,
  Calendar
} from 'lucide-react'
import { loanService, LoanType } from '@/lib/services/loanService'
import DemoModeNotice from '@/components/DemoModeNotice'

function LoanTypesManagementContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([])
  const [loading, setLoading] = useState(false)
  const [editingLoanType, setEditingLoanType] = useState<LoanType | null>(null)
  
  const [formData, setFormData] = useState<Partial<LoanType>>({
    type_name: '',
    description: '',
    interest_rate: 6.00,
    term_months: 1,
    term_days: 30,
    status: 'Active'
  })

  useEffect(() => {
    loadLoanTypes()
  }, [])

  const loadLoanTypes = async () => {
    try {
      setLoading(true)
      const types = await loanService.getLoanTypes()
      setLoanTypes(types)
    } catch (error) {
      console.error('Error loading loan types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLoanType = () => {
    setFormData({
      type_name: '',
      description: '',
      interest_rate: 6.00,
      term_months: 1,
      term_days: 30,
      status: 'Active'
    })
    setEditingLoanType(null)
    setShowForm(true)
  }

  const handleEditLoanType = (loanType: LoanType) => {
    setFormData(loanType)
    setEditingLoanType(loanType)
    setShowForm(true)
  }

  const handleSaveLoanType = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const loanTypeData = {
        ...formData
      } as Omit<LoanType, 'id'>

      if (editingLoanType?.id) {
        // Update existing loan type
        await loanService.updateLoanType(editingLoanType.id, loanTypeData)
      } else {
        // Create new loan type
        await loanService.createLoanType(loanTypeData)
      }
      
      // Reset form and reload data
      setFormData({
        type_name: '',
        description: '',
        interest_rate: 6.00,
        term_months: 1,
        term_days: 30,
        status: 'Active'
      })
      setEditingLoanType(null)
      setShowForm(false)
      loadLoanTypes()
    } catch (error) {
      console.error('Error saving loan type:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLoanType = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan type?')) {
      try {
        await loanService.deleteLoanType(id)
        loadLoanTypes()
      } catch (error) {
        console.error('Error deleting loan type:', error)
      }
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
                  Back to Loan Types
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {editingLoanType ? 'Edit Loan Type' : 'Add New Loan Type'}
                  </h1>
                  <p className="text-lg text-cyan-200 font-semibold">
                    {editingLoanType ? 'Update loan type configuration' : 'Configure new loan type parameters'}
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSaveLoanType}>
            <div className="grid gap-8">
              {/* Basic Information */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Loan Type Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">Configure the basic loan type parameters</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type_name">Loan Type Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="type_name"
                      value={formData.type_name || ''}
                      onChange={(e) => setFormData({...formData, type_name: e.target.value})}
                      placeholder="e.g., 1-Month Regular, 45-Day Emergency"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="bg-white text-gray-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of this loan type"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Interest */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Terms and Interest Configuration
                  </CardTitle>
                  <CardDescription className="text-gray-600">Set the interest rate and loan duration</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%) <span className="text-red-500">*</span></Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      value={formData.interest_rate || 0}
                      onChange={(e) => setFormData({...formData, interest_rate: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Flat rate interest percentage</p>
                  </div>
                  <div>
                    <Label htmlFor="term_months">Term (Months)</Label>
                    <Input
                      id="term_months"
                      type="number"
                      value={formData.term_months || 0}
                      onChange={(e) => setFormData({...formData, term_months: parseInt(e.target.value) || 0})}
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="term_days">Term (Days) <span className="text-red-500">*</span></Label>
                    <Input
                      id="term_days"
                      type="number"
                      value={formData.term_days || 0}
                      onChange={(e) => setFormData({...formData, term_days: parseInt(e.target.value) || 0})}
                      min="1"
                      max="365"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Business days (excluding Sundays)</p>
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
                  {loading ? 'Saving...' : editingLoanType ? 'Update Loan Type' : 'Save Loan Type'}
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
                <h1 className="text-3xl font-bold text-white tracking-tight">Loan Types Management</h1>
                <p className="text-lg text-cyan-200 font-semibold">Configure and manage loan type parameters</p>
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
        
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Loan Type Configuration</h2>
              <p className="text-gray-600">Manage different loan products and their terms</p>
            </div>
            <Button 
              onClick={handleAddLoanType}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Loan Type
            </Button>
          </div>
        </div>

        {/* Loan Types List */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Settings className="h-5 w-5 text-indigo-600" />
              Available Loan Types
            </CardTitle>
            <CardDescription className="text-slate-600">
              Currently configured loan types: {loanTypes.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading loan types...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Type Name</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">Interest Rate</th>
                      <th className="text-left p-3">Term (Days)</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanTypes.map((loanType) => (
                      <tr key={loanType.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{loanType.type_name}</td>
                        <td className="p-3">{loanType.description || '-'}</td>
                        <td className="p-3">{loanType.interest_rate}%</td>
                        <td className="p-3">{loanType.term_days} days</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loanType.status === 'Active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {loanType.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditLoanType(loanType)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => loanType.id && handleDeleteLoanType(loanType.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loanTypes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No loan types configured yet
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

export default function LoanTypesManagementPage() {
  return (
    <ProtectedRoute requiredLevel="Admin">
      <LoanTypesManagementContent />
    </ProtectedRoute>
  )
}