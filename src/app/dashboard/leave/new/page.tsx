'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

export default function NewLeaveRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    emergency_phone: ''
  })

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', balance: 15 },
    { value: 'sick', label: 'Sick Leave', balance: 10 },
    { value: 'study', label: 'Study Leave', balance: 5 },
    { value: 'conference', label: 'Conference Leave', balance: 7 },
    { value: 'sabbatical', label: 'Sabbatical Leave', balance: 0 },
    { value: 'maternity', label: 'Maternity Leave', balance: 0 },
    { value: 'paternity', label: 'Paternity Leave', balance: 0 },
    { value: 'bereavement', label: 'Bereavement Leave', balance: 3 }
  ]

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0
    const start = new Date(formData.start_date)
    const end = new Date(formData.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      alert('Leave request submitted successfully!')
      router.push('/dashboard/leave')
    } catch (error) {
      console.error('Error submitting leave request:', error)
      alert('Failed to submit leave request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const selectedLeaveType = leaveTypes.find(lt => lt.value === formData.leave_type)
  const requestedDays = calculateDays()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/leave">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leave Management
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-blue-600">New Leave Request</h1>
              <p className="text-xs text-muted-foreground">Apply for time off</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Leave Balance Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {leaveTypes.filter(lt => lt.balance > 0).map((type) => (
                  <div key={type.value} className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">{type.label}</p>
                    <p className="text-2xl font-bold text-blue-600">{type.balance}</p>
                    <p className="text-xs text-gray-500">days</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leave Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Request Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Leave Type *
                  </label>
                  <select
                    name="leave_type"
                    required
                    value={formData.leave_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} {type.balance > 0 ? `(${type.balance} days available)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      value={formData.start_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      value={formData.end_date}
                      onChange={handleChange}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Duration Summary */}
                {requestedDays > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Days Requested</p>
                        <p className="text-2xl font-bold text-blue-600">{requestedDays} days</p>
                      </div>
                      {selectedLeaveType && selectedLeaveType.balance > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Remaining Balance</p>
                          <p className={`text-2xl font-bold ${
                            selectedLeaveType.balance >= requestedDays ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedLeaveType.balance - requestedDays} days
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedLeaveType && selectedLeaveType.balance > 0 && selectedLeaveType.balance < requestedDays && (
                      <p className="text-sm text-red-600 mt-2">
                        Warning: You are requesting more days than your available balance!
                      </p>
                    )}
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Leave *
                  </label>
                  <textarea
                    name="reason"
                    required
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Please provide details about your leave request..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact (During Leave)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        name="emergency_contact"
                        required
                        value={formData.emergency_contact}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="emergency_phone"
                        required
                        value={formData.emergency_phone}
                        onChange={handleChange}
                        placeholder="+675 7XXX XXXX"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/leave">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>

                {/* Info Message */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Your leave request will be sent to your department head for approval.
                    You will receive an email notification once your request has been reviewed.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
