export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PNG UNRE HRMS</h1>
        <p className="text-gray-600 mb-6">Select a module from the sidebar to get started</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🌿</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Papua New Guinea University of Natural Resources & Environment
          </h2>
          <p className="text-gray-600 mb-6">
            Complete Human Resources Management and Payroll Solution
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Quick Access</p>
              <p className="text-2xl font-bold text-green-600">7</p>
              <p className="text-xs text-gray-500">Modules Available</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Payroll Pages</p>
              <p className="text-2xl font-bold text-green-600">14</p>
              <p className="text-xs text-gray-500">Complete System</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Navigation</p>
              <p className="text-2xl font-bold text-green-600">3-Level</p>
              <p className="text-xs text-gray-500">Menu System</p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              👈 Use the sidebar on the left to navigate between modules
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
