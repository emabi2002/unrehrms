'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react'
import { employeeService } from '@/lib/db-helpers'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    department: '',
    position: '',
    employment_type: '',
    hire_date: '',
    salary: '',
    status: 'active' as 'active' | 'on_leave' | 'terminated'
  })

  const departments = [
    'Faculty of Environmental Sciences',
    'Faculty of Natural Resources',
    'Faculty of Agriculture',
    'Administrative Services',
    'IT Department',
    'Student Services',
    'Research & Development'
  ]

  const employmentTypes = [
    'Full-time Academic',
    'Full-time Administrative',
    'Full-time Technical',
    'Part-time',
    'Contract',
    'Visiting Faculty'
  ]

  const positions = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lecturer',
    'Research Fellow',
    'HR Officer',
    'Systems Administrator',
    'Administrative Assistant',
    'Technical Officer'
  ]

  useEffect(() => {
    loadEmployee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadEmployee = async () => {
    try {
      const { data, error } = await employeeService.getById(params.id as string)

      if (error) {
        toast.error('Failed to load employee data')
        return
      }

      if (data) {
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          employee_id: data.employee_id,
          department: data.department,
          position: data.position,
          employment_type: data.employment_type,
          hire_date: data.hire_date,
          salary: data.salary.toString(),
          status: data.status
        })

        // Load profile picture if exists
        if (data.profile_picture) {
          const { data: imageData } = supabase.storage
            .from('employee-profiles')
            .getPublicUrl(data.profile_picture)
          setProfileImage(imageData.publicUrl)
        }
      }
    } catch (error) {
      console.error('Error loading employee:', error)
      toast.error('An error occurred while loading employee data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    setUploading(true)
    const loadingToast = toast.loading('Uploading profile picture...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${params.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('employee-profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('employee-profiles')
        .getPublicUrl(filePath)

      setProfileImage(urlData.publicUrl)

      // Update employee record with profile picture path
      await employeeService.update(params.id as string, {
        profile_picture: filePath
      })

      toast.success('Profile picture uploaded successfully', { id: loadingToast })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload profile picture', { id: loadingToast })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!profileImage) return

    try {
      setProfileImage(null)
      await employeeService.update(params.id as string, {
        profile_picture: null
      })
      toast.success('Profile picture removed')
    } catch (error) {
      console.error('Error removing image:', error)
      toast.error('Failed to remove profile picture')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const loadingToast = toast.loading('Updating employee...')

    try {
      const { error } = await employeeService.update(params.id as string, {
        ...formData,
        salary: parseFloat(formData.salary)
      })

      if (error) throw error

      toast.success('Employee updated successfully!', { id: loadingToast })
      router.push(`/dashboard/employees/${params.id}`)
    } catch (error) {
      console.error('Error updating employee:', error)
      toast.error('Failed to update employee', { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/employees/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Employee
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-primary">Edit Employee</h1>
              <p className="text-xs text-muted-foreground">Update employee information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profileImage ? (
                      <div className="relative">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-32 w-32 rounded-full object-cover border-4 border-primary/10"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary">
                          {formData.first_name[0]}{formData.last_name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="profile-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="profile-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => document.getElementById('profile-upload')?.click()}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </>
                        )}
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Employee ID *</label>
                    <input
                      type="text"
                      name="employee_id"
                      required
                      value={formData.employee_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department *</label>
                    <select
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Position *</label>
                    <select
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Employment Type *</label>
                    <select
                      name="employment_type"
                      required
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hire Date *</label>
                    <input
                      type="date"
                      name="hire_date"
                      required
                      value={formData.hire_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Annual Salary (PGK) *</label>
                    <input
                      type="number"
                      name="salary"
                      required
                      value={formData.salary}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status *</label>
                    <select
                      name="status"
                      required
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Link href={`/dashboard/employees/${params.id}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
