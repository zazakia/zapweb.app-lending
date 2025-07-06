'use client'

import { useTheme } from '@/contexts/ThemeContext'
import SidebarLayout from './SidebarLayout'

interface ThemedLayoutProps {
  children: React.ReactNode
  dashboardContent?: React.ReactNode
}

export default function ThemedLayout({ children, dashboardContent }: ThemedLayoutProps) {
  const { theme } = useTheme()

  if (theme === 'sidebar') {
    return (
      <SidebarLayout>
        {children}
      </SidebarLayout>
    )
  }

  // Return dashboard theme (original layout)
  return dashboardContent || children
}