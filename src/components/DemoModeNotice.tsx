import { AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DemoModeNotice() {
  if (supabase) return null // Only show in demo mode

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-l-4 border-orange-500 p-4 mb-4">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
        <div>
          <p className="text-sm font-medium text-orange-800">
            Demo Mode Active
          </p>
          <p className="text-xs text-orange-700 mt-1">
            You&apos;re using mock data. To connect to a real database, configure your Supabase environment variables.
          </p>
        </div>
      </div>
    </div>
  )
}