import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Face Recognition Clock-In MVP
        </h1>
        <p className="text-gray-600 mb-8">
          Employee attendance system with Face++ passive liveness detection
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee Registration Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Register Employee</h2>
          <p className="text-gray-600 mb-4">
            Add new employees with face registration and liveness verification
          </p>
          <Link href="/register" className="btn-primary inline-block">
            Register Employee
          </Link>
        </div>

        {/* Clock-In Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Clock In/Out</h2>
          <p className="text-gray-600 mb-4">
            Employee clock-in with face recognition and passive liveness detection
          </p>
          <Link href="/clockin" className="btn-primary inline-block">
            Clock In
          </Link>
        </div>

        {/* Dashboard Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Activity Dashboard</h2>
          <p className="text-gray-600 mb-4">
            View recent clock-ins and system analytics
          </p>
          <Link href="/dashboard" className="btn-primary inline-block">
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Registered Employees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Today's Clock-ins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Recognition Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-sm text-gray-600">Liveness Detection</div>
          </div>
        </div>
      </div>
    </div>
  )
}
