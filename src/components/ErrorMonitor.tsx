'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { errorLogger, ErrorLogEntry } from '@/lib/errorLogger'
import { 
  AlertTriangle, 
  Bug, 
  Download, 
  Trash2, 
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  BarChart3
} from 'lucide-react'

interface ErrorMonitorProps {
  className?: string
}

export default function ErrorMonitor({ className }: ErrorMonitorProps) {
  const [logs, setLogs] = useState<ErrorLogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    // Load initial logs
    setLogs(errorLogger.getLogs())

    // Subscribe to new errors
    const unsubscribe = errorLogger.subscribe((newError) => {
      setLogs(prev => [...prev, newError])
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLogs(errorLogger.getLogs())
    }, 2000) // Refresh every 2 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.level === filter
  }).slice(-100) // Show last 100 logs

  const stats = errorLogger.getStats()

  const handleClearLogs = () => {
    errorLogger.clearLogs()
    setLogs([])
  }

  const handleExportJSON = () => {
    const dataStr = errorLogger.exportLogs()
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `melann-error-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csvStr = errorLogger.exportLogsAsCSV()
    const dataBlob = new Blob([csvStr], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `melann-error-logs-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warn': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'console': return '🖥️'
      case 'network': return '🌐'
      case 'unhandled': return '⚠️'
      case 'promise': return '🔄'
      case 'manual': return '✍️'
      default: return '❓'
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Error Monitor
          {stats.byLevel.error > 0 && (
            <Badge variant="destructive" className="ml-2">
              {stats.byLevel.error}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 max-h-96 z-50 ${className}`}>
      <Card className="shadow-lg border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Error Monitor</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'text-green-600' : 'text-gray-400'}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time error tracking and monitoring
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">{stats.byLevel.error}</div>
              <div className="text-xs text-red-600">Errors</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{stats.byLevel.warn}</div>
              <div className="text-xs text-yellow-600">Warnings</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">{stats.byLevel.info}</div>
              <div className="text-xs text-blue-600">Info</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportJSON}
                title="Export as JSON"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportCSV}
                title="Export as CSV"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLogs}
                title="Clear logs"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Log entries */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No logs to display
              </div>
            ) : (
              filteredLogs.reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-2 border rounded text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span>{getSourceIcon(log.source)}</span>
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-700 break-words">
                    {log.message}
                  </div>
                  {log.context && (
                    <details className="text-gray-500">
                      <summary className="cursor-pointer">Context</summary>
                      <pre className="text-xs mt-1 bg-gray-50 p-1 rounded overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}