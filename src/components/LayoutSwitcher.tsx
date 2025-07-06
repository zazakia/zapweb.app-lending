'use client'

import { memo } from 'react'
import SidebarNavigationLayout from './SidebarNavigationLayout'

interface LayoutSwitcherProps {
  children: React.ReactNode
}

const LayoutSwitcher = memo(({ children }: LayoutSwitcherProps) => {
  // Always use sidebar navigation layout
  return <SidebarNavigationLayout>{children}</SidebarNavigationLayout>
})

LayoutSwitcher.displayName = 'LayoutSwitcher'

export default LayoutSwitcher