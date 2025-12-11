'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Star,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface EmergencyContact {
  id: string
  employee_id: string
  full_name: string
  relationship: string
  phone: string
  mobile?: string
  email?: string
  address?: string
  city?: string
  province?: string
  priority: number
  is_primary: boolean
  notes?: string
}

const relationships = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Partner',
  'Friend',
  'Guardian',
  'Other'
]

const provinces = [
  'Central',
  'Chimbu',
  'Eastern Highlands',
  'East New Britain',
  'East Sepik',
  'Enga',
  'Gulf',
  'Hela',
  'Jiwaka',
  'Madang',
  'Manus',
  'Milne Bay',
  'Morobe',
  'New Ireland',
  'Northern (Oro)',
  'Southern Highlands',
  'Western',
  'Western Highlands',
  'West New Britain',
  'West Sepik',
  'National Capital District'
]

export default function EmergencyContactsPage() {
  const params = useParams()
  const employeeId = params.id as string

  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    relationship: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    province: '',
    priority: 1,
    is_primary: false,
    notes: ''
  })

  useEffect(() => {
    loadContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  const loadContacts = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual Supabase call
      // const { data, error } = await supabase
      //   .from('emergency_contacts')
      //   .select('*')
      //   .eq('employee_id', employeeId)
      //   .order('priority')

      // Sample data for now
      const sampleData: EmergencyContact[] = [
        {
          id: '1',
          employee_id: employeeId,
          full_name: 'Jane Kila',
          relationship: 'Spouse',
          phone: '+675 7234 5678',
          mobile: '+675 7234 5679',
          email: 'jane.kila@email.com',
          address: '123 Main Street',
          city: 'Port Moresby',
          province: 'National Capital District',
          priority: 1,
          is_primary: true,
          notes: 'Primary emergency contact'
        }
      ]

      setContacts(sampleData)
    } catch (error) {
      console.error('Error loading contacts:', error)
      toast.error('Failed to load emergency contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact)
      setFormData({
        full_name: contact.full_name,
        relationship: contact.relationship,
        phone: contact.phone,
        mobile: contact.mobile || '',
        email: contact.email || '',
        address: contact.address || '',
        city: contact.city || '',
        province: contact.province || '',
        priority: contact.priority,
        is_primary: contact.is_primary,
        notes: contact.notes || ''
      })
    } else {
      setEditingContact(null)
      setFormData({
        full_name: '',
        relationship: '',
        phone: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        province: '',
        priority: contacts.length + 1,
        is_primary: contacts.length === 0,
        notes: ''
      })
    }
    setShowDialog(true)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.full_name || !formData.relationship || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingContact) {
        // Update existing contact
        // TODO: Supabase update
        toast.success('Emergency contact updated successfully')
      } else {
        // Create new contact
        // TODO: Supabase insert
        toast.success('Emergency contact added successfully')
      }

      setShowDialog(false)
      loadContacts()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error('Failed to save emergency contact')
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) {
      return
    }

    try {
      // TODO: Supabase delete
      toast.success('Emergency contact deleted successfully')
      loadContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Failed to delete emergency contact')
    }
  }

  const handleSetPrimary = async (contactId: string) => {
    try {
      // TODO: Supabase update - set all is_primary to false, then set this one to true
      toast.success('Primary contact updated')
      loadContacts()
    } catch (error) {
      console.error('Error setting primary:', error)
      toast.error('Failed to update primary contact')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading emergency contacts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Emergency Contacts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage emergency contact information for quick access during emergencies
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Emergency Contacts</h3>
          <p className="text-gray-500 mb-6">Add emergency contacts to ensure quick communication during emergencies</p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Contact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                contact.is_primary ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{contact.full_name}</h3>
                      {contact.is_primary && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDialog(contact)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!contact.is_primary && (
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-gray-700">{contact.phone}</div>
                    {contact.mobile && (
                      <div className="text-gray-500">{contact.mobile}</div>
                    )}
                  </div>
                </div>

                {contact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{contact.email}</span>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="text-gray-700">
                      <div>{contact.address}</div>
                      {contact.city && contact.province && (
                        <div className="text-gray-500">{contact.city}, {contact.province}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 italic">{contact.notes}</p>
                </div>
              )}

              {/* Actions */}
              {!contact.is_primary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(contact.id)}
                    className="w-full"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Set as Primary Contact
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+675 7XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+675 7XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Set as primary emergency contact
                  </span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              {editingContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
