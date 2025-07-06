'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  username: string
  fullName: string
  userLevel: 'Admin' | 'Manager' | 'Cashier' | 'Collector'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual Supabase authentication
      // For now, using simple hardcoded credentials
      if (username === 'admin' && password === 'admin123') {
        const userData: User = {
          username: 'admin',
          fullName: 'System Administrator',
          userLevel: 'Admin'
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      } else if (username === 'cashier' && password === 'cashier123') {
        const userData: User = {
          username: 'cashier',
          fullName: 'Main Cashier',
          userLevel: 'Cashier'
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      } else if (username === 'collector' && password === 'collector123') {
        const userData: User = {
          username: 'collector',
          fullName: 'Field Collector',
          userLevel: 'Collector'
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      }
      
      return false
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to check if user has required permission level
export function usePermission(requiredLevel: User['userLevel']) {
  const { user } = useAuth()
  
  if (!user) return false
  
  const levels = ['Collector', 'Cashier', 'Manager', 'Admin']
  const userLevelIndex = levels.indexOf(user.userLevel)
  const requiredLevelIndex = levels.indexOf(requiredLevel)
  
  return userLevelIndex >= requiredLevelIndex
}