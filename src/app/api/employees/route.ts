import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Employee from '@/models/Employee'

export async function GET() {
  try {
    await connectToDatabase()
    
    const employees = await Employee.find({})
      .select('employee_id name created_at')
      .sort({ created_at: -1 })
    
    return NextResponse.json({
      success: true,
      employees
    })
  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
