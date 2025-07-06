# Melann Lending Management System - Developer Documentation

## Overview
This document provides comprehensive technical documentation for developers working on the Melann Lending Management System. The system is built with Next.js 14, TypeScript, Supabase, and modern web technologies.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [State Management](#state-management)
- [Database Schema](#database-schema)
- [API Integration](#api-integration)
- [Performance Optimization](#performance-optimization)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)
- [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

### System Architecture
The system follows a modern web application architecture with:
- **Frontend**: Next.js 14 with React 19 and TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Context + Custom Hooks
- **Performance**: Optimized with memoization and code splitting

### Design Patterns
- **Component-Based Architecture**: Reusable UI components
- **Custom Hooks**: Business logic abstraction
- **Service Layer**: API interaction abstraction
- **Context Providers**: Global state management
- **Error Boundaries**: Graceful error handling

## Technology Stack

### Core Technologies
```json
{
  "frontend": {
    "framework": "Next.js 15.3.5",
    "language": "TypeScript 5.x",
    "ui": "React 19.0.0",
    "styling": "Tailwind CSS 4.x",
    "components": "Radix UI",
    "icons": "Lucide React"
  },
  "backend": {
    "database": "Supabase PostgreSQL",
    "auth": "Supabase Auth",
    "api": "Supabase API",
    "storage": "Supabase Storage"
  },
  "development": {
    "testing": "Jest + Testing Library",
    "linting": "ESLint + Prettier",
    "bundler": "Webpack (Next.js)",
    "performance": "Lighthouse + Puppeteer"
  }
}
```

### Dependencies
```bash
# Core dependencies
npm install next react react-dom typescript
npm install @supabase/supabase-js @supabase/ssr
npm install tailwindcss @tailwindcss/postcss
npm install @radix-ui/react-* lucide-react
npm install class-variance-authority clsx tailwind-merge

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint eslint-config-next
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D puppeteer lighthouse @next/bundle-analyzer
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag
  - GitLens

### Environment Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lending-melan-proposal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Database Setup
1. **Create Supabase project**
   - Sign up at https://supabase.com
   - Create new project
   - Copy URL and anon key to `.env.local`

2. **Run database migrations**
   ```bash
   # Execute the provided schema file
   psql -f database-schema.sql
   ```

3. **Configure Row Level Security (RLS)**
   Enable RLS on all tables and configure appropriate policies.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin-specific pages
│   ├── auth/              # Authentication pages
│   ├── customers/         # Customer management
│   ├── loans/             # Loan management
│   ├── payments/          # Payment processing
│   ├── reports/           # Reporting module
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── modals/           # Modal components
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── SettingsContext.tsx # App settings
├── lib/                  # Utility libraries
│   ├── services/         # API services
│   ├── utils.ts          # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useCustomers.ts   # Customer operations
│   └── usePerformance.ts # Performance monitoring
└── styles/               # Additional styles
```

## Core Components

### Layout Components

#### `TopNavigationLayout`
```typescript
// src/components/layouts/TopNavigationLayout.tsx
import React, { memo } from 'react'

interface TopNavigationLayoutProps {
  children: React.ReactNode
}

const TopNavigationLayout: React.FC<TopNavigationLayoutProps> = memo(({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        {/* Navigation content */}
      </nav>
      <main>{children}</main>
    </div>
  )
})

export default TopNavigationLayout
```

#### `SidebarNavigationLayout`
```typescript
// src/components/layouts/SidebarNavigationLayout.tsx
import React, { memo, useState } from 'react'

const SidebarNavigationLayout: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`bg-white border-r transition-all ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Sidebar content */}
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
})

export default SidebarNavigationLayout
```

### Performance Components

#### `OptimizedNavigationButton`
```typescript
// src/components/OptimizedNavigationButton.tsx
import React, { memo, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavigationOptimizer } from '@/lib/navigationOptimizer'

interface OptimizedNavigationButtonProps {
  href: string
  children: React.ReactNode
  prefetch?: boolean
  className?: string
}

const OptimizedNavigationButton: React.FC<OptimizedNavigationButtonProps> = memo(({
  href,
  children,
  prefetch = true,
  className = ''
}) => {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsNavigating(true)
    
    try {
      await router.push(href)
    } finally {
      setIsNavigating(false)
    }
  }, [router, href])

  const handleMouseEnter = useCallback(() => {
    if (prefetch) {
      NavigationOptimizer.preloadRoute(href)
    }
  }, [href, prefetch])

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={isNavigating}
      className={`${className} ${isNavigating ? 'opacity-50' : ''}`}
    >
      {children}
    </button>
  )
})

export default OptimizedNavigationButton
```

## State Management

### Authentication Context
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Settings Context
```typescript
// src/contexts/SettingsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'

interface SettingsContextType {
  navigationPosition: 'top' | 'left'
  setNavigationPosition: (position: 'top' | 'left') => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navigationPosition, setNavigationPosition] = useState<'top' | 'left'>('top')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [compactMode, setCompactMode] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setNavigationPosition(settings.navigationPosition || 'top')
      setTheme(settings.theme || 'light')
      setCompactMode(settings.compactMode || false)
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage
    const settings = { navigationPosition, theme, compactMode }
    localStorage.setItem('app-settings', JSON.stringify(settings))
  }, [navigationPosition, theme, compactMode])

  return (
    <SettingsContext.Provider value={{
      navigationPosition,
      setNavigationPosition,
      theme,
      setTheme,
      compactMode,
      setCompactMode
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
```

## Database Schema

### Core Tables
```sql
-- customers table
CREATE TABLE lending1.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  civil_status VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  credit_score INTEGER DEFAULT 750,
  late_payment_count INTEGER DEFAULT 0,
  late_payment_points INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- loans table
CREATE TABLE lending1.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES lending1.customers(id),
  loan_type_id UUID NOT NULL REFERENCES lending1.loan_types(id),
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_months INTEGER NOT NULL,
  loan_status VARCHAR(20) DEFAULT 'pending',
  current_balance DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payments table
CREATE TABLE lending1.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES lending1.loans(id),
  payment_amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_customers_customer_code ON lending1.customers(customer_code);
CREATE INDEX idx_customers_status ON lending1.customers(status);
CREATE INDEX idx_loans_customer_id ON lending1.loans(customer_id);
CREATE INDEX idx_loans_status ON lending1.loans(loan_status);
CREATE INDEX idx_payments_loan_id ON lending1.payments(loan_id);
CREATE INDEX idx_payments_date ON lending1.payments(payment_date);
```

## API Integration

### Service Layer Pattern
```typescript
// src/lib/services/customerService.ts
import { supabase } from '@/lib/supabase'
import { Customer } from '@/lib/types'

class CustomerService {
  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async searchCustomers(searchTerm: string, limit = 50): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,customer_code.ilike.%${searchTerm}%`)
      .limit(limit)

    if (error) throw error
    return data
  }
}

export const customerService = new CustomerService()
```

### Custom Hooks
```typescript
// src/hooks/useCustomers.ts
import { useState, useEffect, useCallback } from 'react'
import { customerService } from '@/lib/services/customerService'
import { Customer } from '@/lib/types'

export const useCustomers = (limit = 50, offset = 0) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await customerService.getCustomers(limit, offset)
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [limit, offset])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCustomer = await customerService.createCustomer(customer)
      setCustomers(prev => [newCustomer, ...prev])
      return newCustomer
    } catch (err) {
      throw err
    }
  }, [])

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer
  }
}
```

## Performance Optimization

### Navigation Optimization
```typescript
// src/lib/navigationOptimizer.ts
class NavigationOptimizer {
  private static prefetchedRoutes = new Set<string>()
  private static dataCache = new Map<string, { data: any; timestamp: number }>()

  static preloadRoute(href: string) {
    if (this.prefetchedRoutes.has(href)) return

    // Preload route
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)

    this.prefetchedRoutes.add(href)
  }

  static async prefetchData<T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60 * 1000): Promise<T> {
    const cached = this.dataCache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data
    }

    const data = await fetcher()
    this.dataCache.set(key, { data, timestamp: now })
    return data
  }

  static clearCache() {
    this.dataCache.clear()
  }
}

export { NavigationOptimizer }
```

### React Performance Optimizations
```typescript
// Example of optimized component
import React, { memo, useMemo, useCallback } from 'react'

interface OptimizedListProps {
  items: any[]
  onItemClick: (item: any) => void
  filterTerm: string
}

const OptimizedList = memo<OptimizedListProps>(({ items, onItemClick, filterTerm }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(filterTerm.toLowerCase())
    )
  }, [items, filterTerm])

  const handleItemClick = useCallback((item: any) => {
    onItemClick(item)
  }, [onItemClick])

  return (
    <div>
      {filteredItems.map(item => (
        <div key={item.id} onClick={() => handleItemClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
})

export default OptimizedList
```

## Testing Strategy

### Unit Testing
```typescript
// src/components/__tests__/OptimizedNavigationButton.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import OptimizedNavigationButton from '../OptimizedNavigationButton'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

describe('OptimizedNavigationButton', () => {
  it('renders button with children', () => {
    render(
      <OptimizedNavigationButton href="/test">
        Test Button
      </OptimizedNavigationButton>
    )
    
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('handles click navigation', async () => {
    const mockPush = jest.fn()
    jest.mocked(useRouter).mockReturnValue({ push: mockPush })

    render(
      <OptimizedNavigationButton href="/test">
        Test Button
      </OptimizedNavigationButton>
    )

    fireEvent.click(screen.getByText('Test Button'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test')
    })
  })

  it('shows loading state during navigation', async () => {
    render(
      <OptimizedNavigationButton href="/test">
        Test Button
      </OptimizedNavigationButton>
    )

    const button = screen.getByText('Test Button')
    fireEvent.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })
})
```

### Performance Testing
```typescript
// tests/performance/lighthouse.test.js
const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')

describe('Lighthouse Performance Tests', () => {
  let browser
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true })
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should meet performance benchmarks', async () => {
    const { port } = new URL(browser.wsEndpoint())
    
    const result = await lighthouse('http://localhost:3000', {
      port,
      disableStorageReset: true
    })

    const scores = JSON.parse(result.report)
    
    expect(scores.categories.performance.score).toBeGreaterThan(0.8)
    expect(scores.categories.accessibility.score).toBeGreaterThan(0.9)
    expect(scores.categories['best-practices'].score).toBeGreaterThan(0.8)
  })
})
```

## Deployment Guide

### Environment Setup
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start

# Build with analysis
npm run analyze
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next
```

## Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Include tests for new features

### Git Workflow
1. Create feature branch from main
2. Make changes and commit
3. Push branch and create pull request
4. Code review and merge

### Pull Request Template
```markdown
## Description
Brief description of changes

## Changes Made
- Feature 1
- Feature 2
- Bug fix

## Testing
- [ ] Unit tests pass
- [ ] Performance tests pass
- [ ] Manual testing completed

## Screenshots
(if applicable)
```

### Performance Guidelines
- Components should render in <100ms
- Page load should be <3 seconds
- Bundle size should be <1.5MB
- Use React.memo for expensive components
- Implement proper loading states

---

This documentation serves as a comprehensive guide for developers working on the Melann Lending Management System. For additional information or clarification, please refer to the codebase comments or contact the development team.