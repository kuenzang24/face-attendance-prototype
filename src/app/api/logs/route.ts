import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import ClockLog from '@/models/ClockLog'
import Employee from '@/models/Employee'

export async function GET() {
  try {
    await connectToDatabase()
    
    // Get recent clock logs with employee information
    const logs = await ClockLog.find({})
      .populate('employee_id', 'name employee_id')
      .sort({ created_at: -1 })
      .limit(50)
    
    // Process logs to include employee names
    const processedLogs = logs.map(log => ({
      _id: log._id,
      employee_id: log.employee_id?._id || null,
      timestamp: log.timestamp,
      recognition: log.recognition,
      status: log.status,
      employee_name: log.employee_id?.name || 'Unknown'
    }))
    
    // Calculate statistics
    const totalEmployees = await Employee.countDocuments()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayClockIns = await ClockLog.countDocuments({
      timestamp: { $gte: today },
      status: 'success'
    })
    
    const totalAttempts = await ClockLog.countDocuments()
    const successfulAttempts = await ClockLog.countDocuments({ status: 'success' })
    
    // Calculate average face quality from successful attempts
    const successfulLogs = await ClockLog.find({ status: 'success' })
    const avgFaceQuality = successfulLogs.length > 0 
      ? successfulLogs.reduce((acc, log) => acc + (log.recognition?.confidence || 0), 0) / successfulLogs.length 
      : 0
    
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0
    
    const stats = {
      totalEmployees,
      todayClockIns,
      successRate,
      avgFaceQuality
    }
    
    return NextResponse.json({
      success: true,
      logs: processedLogs,
      stats
    })
  } catch (error: any) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
