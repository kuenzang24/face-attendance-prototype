'use client'

import { useState, useEffect } from 'react'

interface Employee {
  _id: string
  employee_id: string
  name: string
  created_at: string
}

interface ClockLog {
  _id: string
  employee_id: string
  timestamp: string
  recognition: {
    confidence: number
    similarity_score: number
  }
  liveness: {
    confidence: number
    result: string
  }
  status: string
  employee_name?: string
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [clockLogs, setClockLogs] = useState<ClockLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayClockIns: 0,
    successRate: 0,
    livenessRate: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch employees and logs in parallel
      const [employeesRes, logsRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/logs')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData.employees || [])
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setClockLogs(logsData.logs || [])
        setStats(logsData.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'failed_recognition': return 'text-red-600 bg-red-100'
      case 'failed_liveness': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Activity Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Real-time monitoring of employee attendance and system performance
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</div>
          <div className="text-sm text-gray-600">Registered Employees</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.todayClockIns}</div>
          <div className="text-sm text-gray-600">Today's Clock-ins</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.successRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Recognition Success</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.livenessRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Liveness Detection</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registered Employees */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Registered Employees</h2>
          {employees.length === 0 ? (
            <p className="text-gray-500">No employees registered yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">ID: {employee.employee_id}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDateTime(employee.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clock-in Attempts */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Clock-in Attempts</h2>
          {clockLogs.length === 0 ? (
            <p className="text-gray-500">No clock-in attempts yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clockLogs.slice(0, 10).map((log) => (
                <div key={log._id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">
                        {log.employee_name || 'Unknown Employee'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Recognition: {(log.recognition.confidence * 100).toFixed(1)}% | 
                        Liveness: {(log.liveness.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDateTime(log.timestamp)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {log.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={fetchData}
          className="btn-secondary"
        >
          Refresh Data
        </button>
      </div>
    </div>
  )
}
