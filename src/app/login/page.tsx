'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Lock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Replace with actual Supabase authentication
      const success = await login(username, password)
      
      if (success) {
        router.push('/')
      } else {
        setError('Invalid username or password')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-cyan-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative w-full max-w-md">
        {/* Company Logo/Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            MELANN LENDING
          </h1>
          <p className="text-xl text-cyan-200 font-semibold">
            INVESTOR CORP.
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Lending Business Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              User Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Cashier:</strong> cashier / cashier123</p>
                <p><strong>Collector:</strong> collector / collector123</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>© 2025 Melann Lending Investor Corp.</p>
              <p className="mt-1">Built with Next.js & Supabase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}