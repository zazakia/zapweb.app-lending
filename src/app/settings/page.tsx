'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ProtectedRoute from '@/components/ProtectedRoute'
import LayoutSwitcher from '@/components/LayoutSwitcher'
import { useSettings } from '@/contexts/SettingsContext'
import { 
  Settings as SettingsIcon,
  Monitor,
  Sidebar,
  Layout,
  Palette,
  Save,
  RotateCcw,
  Check,
  Menu,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

function SettingsContent() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const router = useRouter()

  const handleLayoutChange = (layout: 'top' | 'left') => {
    updateSettings({ navigationPosition: layout })
  }

  const handleCompactModeToggle = () => {
    updateSettings({ compactMode: !settings.compactMode })
  }

  const handleSidebarToggle = () => {
    updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-indigo-600" />
              Application Settings
            </h1>
            <p className="text-gray-600 mt-1">Customize your Melann Lending experience</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Layout Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-indigo-600" />
              Layout Configuration
            </CardTitle>
            <CardDescription>
              Choose how you want to navigate through the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Navigation Position */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Navigation Position
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={settings.navigationPosition === 'top' ? 'default' : 'outline'}
                  onClick={() => handleLayoutChange('top')}
                  className="h-20 flex flex-col gap-2"
                >
                  <Monitor className="h-6 w-6" />
                  <span className="text-sm font-medium">Top Menu</span>
                  <span className="text-xs text-gray-500">Traditional layout</span>
                </Button>
                <Button
                  variant={settings.navigationPosition === 'left' ? 'default' : 'outline'}
                  onClick={() => handleLayoutChange('left')}
                  className="h-20 flex flex-col gap-2"
                >
                  <Sidebar className="h-6 w-6" />
                  <span className="text-sm font-medium">Left Sidebar</span>
                  <span className="text-xs text-gray-500">Modern layout</span>
                </Button>
              </div>
            </div>

            {/* Sidebar Settings (only for left navigation) */}
            {settings.navigationPosition === 'left' && (
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Sidebar Options
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Menu className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Collapsed by Default</p>
                        <p className="text-sm text-gray-600">Start with a collapsed sidebar</p>
                      </div>
                    </div>
                    <Button
                      variant={settings.sidebarCollapsed ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleSidebarToggle}
                    >
                      {settings.sidebarCollapsed ? <Check className="h-4 w-4" /> : 'Off'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Compact Mode */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Display Options
              </Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Compact Mode</p>
                    <p className="text-sm text-gray-600">Reduce spacing for more content</p>
                  </div>
                </div>
                <Button
                  variant={settings.compactMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleCompactModeToggle}
                >
                  {settings.compactMode ? <Check className="h-4 w-4" /> : 'Off'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Color Theme
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="h-16 flex flex-col gap-1"
                >
                  <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="h-16 flex flex-col gap-1"
                >
                  <div className="w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded"></div>
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={settings.theme === 'system' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="h-16 flex flex-col gap-1"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-white to-gray-800 border-2 border-gray-400 rounded"></div>
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </div>

            {/* Current Settings Preview */}
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3">Current Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Navigation:</span>
                  <span className="font-medium text-indigo-900 capitalize">
                    {settings.navigationPosition === 'left' ? 'Left Sidebar' : 'Top Menu'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Theme:</span>
                  <span className="font-medium text-indigo-900 capitalize">{settings.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Compact Mode:</span>
                  <span className="font-medium text-indigo-900">
                    {settings.compactMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {settings.navigationPosition === 'left' && (
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Sidebar:</span>
                    <span className="font-medium text-indigo-900">
                      {settings.sidebarCollapsed ? 'Collapsed' : 'Expanded'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={resetSettings}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">Changes are saved automatically</p>
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + D</kbd> - Dashboard</div>
          <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + C</kbd> - Customers</div>
          <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + L</kbd> - Loans</div>
          <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + P</kbd> - Payments</div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <LayoutSwitcher>
        <SettingsContent />
      </LayoutSwitcher>
    </ProtectedRoute>
  )
}