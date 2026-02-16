'use client'

import { memo } from 'react'
import TopNavigationLayout from './TopNavigationLayout'
import SidebarNavigationLayout from './SidebarNavigationLayout'
import { useSettings } from '@/contexts/SettingsContext'

interface LayoutSwitcherProps {
  children: React.ReactNode
}

const LayoutSwitcher = memo(({ children }: LayoutSwitcherProps) => {
  const { settings } = useSettings()

  if (settings.navigationPosition === 'left') {
    return <SidebarNavigationLayout>{children}</SidebarNavigationLayout>
  }

  return <TopNavigationLayout>{children}</TopNavigationLayout>
})

LayoutSwitcher.displayName = 'LayoutSwitcher'

export default LayoutSwitcher