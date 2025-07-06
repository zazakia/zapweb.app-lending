'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredLevel?: 'Admin' | 'Manager' | 'Cashier' | 'Collector'
}

export default function ProtectedRoute({ children, requiredLevel }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requiredLevel) {
        const levels = ['Collector', 'Cashier', 'Manager', 'Admin']
        const userLevelIndex = levels.indexOf(user.userLevel)
        const requiredLevelIndex = levels.indexOf(requiredLevel)
        
        if (userLevelIndex < requiredLevelIndex) {
          // User doesn't have required permission level
          router.push('/')
          return
        }
      }
    }
  }, [user, loading, router, requiredLevel])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (requiredLevel) {
    const levels = ['Collector', 'Cashier', 'Manager', 'Admin']
    const userLevelIndex = levels.indexOf(user.userLevel)
    const requiredLevelIndex = levels.indexOf(requiredLevel)
    
    if (userLevelIndex < requiredLevelIndex) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required level: {requiredLevel} | Your level: {user.userLevel}
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}