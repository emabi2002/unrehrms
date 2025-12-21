'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Heart, Activity, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MedicalRecord {
  id: string;
  employee_id: string;
  checkup_date: string;
  checkup_type: string;
  medical_provider?: string;
  blood_pressure?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  medications?: string;
  vaccinations?: string;
  fitness_for_duty: boolean;
  restrictions?: string;
  next_checkup_date?: string;
  notes?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function MedicalCheckupsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    checkup_date: new Date().toISOString().split('T')[0],
    checkup_type: 'annual_physical',
    medical_provider: '',
    blood_pressure: '',
    height: '',
    weight: '',
    blood_type: '',
    allergies: '',
    chronic_conditions: '',
    medications: '',
    vaccinations: '',
    fitness_for_duty: true,
    restrictions: '',
    next_checkup_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadRecords(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords() {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number)
      `)
      .order('checkup_date', { ascending: false });

    if (error) throw error;
    setRecords(data || []);
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number')
      .eq('employment_status', 'Active')
      .order('first_name');

    if (error) throw error;
    setEmployees(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const bmi = formData.height && formData.weight
        ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
        : null;

      const recordData = {
        employee_id: formData.employee_id,
        checkup_date: formData.checkup_date,
        checkup_type: formData.checkup_type,
        medical_provider: formData.medical_provider || null,
        blood_pressure: formData.blood_pressure || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        blood_type: formData.blood_type || null,
        allergies: formData.allergies || null,
        chronic_conditions: formData.chronic_conditions || null,
        medications: formData.medications || null,
        vaccinations: formData.vaccinations || null,
        fitness_for_duty: formData.fitness_for_duty,
        restrictions: formData.restrictions || null,
        next_checkup_date: formData.next_checkup_date || null,
        notes: formData.notes || null,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('medical_records')
          .update(recordData)
          .eq('id', editingRecord.id);

        if (error) throw error;
        toast.success('Medical record updated successfully');
      } else {
        const { error } = await supabase
          .from('medical_records')
          .insert([recordData]);

        if (error) throw error;
        toast.success('Medical record created successfully');
      }

      setDialogOpen(false);
      loadRecords();
      resetForm();
    } catch (error: any) {
      console.error('Error saving record:', error);
      toast.error(error.message || 'Failed to save medical record');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this medical record?')) return;

    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Medical record deleted successfully');
      loadRecords();
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete medical record');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingRecord(null);
    setDialogOpen(true);
  }

  function handleEdit(record: MedicalRecord) {
    setEditingRecord(record);
    setFormData({
      employee_id: record.employee_id,
      checkup_date: record.checkup_date,
      checkup_type: record.checkup_type,
      medical_provider: record.medical_provider || '',
      blood_pressure: record.blood_pressure || '',
      height: record.height?.toString() || '',
      weight: record.weight?.toString() || '',
      blood_type: record.blood_type || '',
      allergies: record.allergies || '',
      chronic_conditions: record.chronic_conditions || '',
      medications: record.medications || '',
      vaccinations: record.vaccinations || '',
      fitness_for_duty: record.fitness_for_duty,
      restrictions: record.restrictions || '',
      next_checkup_date: record.next_checkup_date || '',
      notes: record.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      checkup_date: new Date().toISOString().split('T')[0],
      checkup_type: 'annual_physical',
      medical_provider: '',
      blood_pressure: '',
      height: '',
      weight: '',
      blood_type: '',
      allergies: '',
      chronic_conditions: '',
      medications: '',
      vaccinations: '',
      fitness_for_duty: true,
      restrictions: '',
      next_checkup_date: '',
      notes: '',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-1">Track employee health checkups and medical information</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fit for Duty</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.fitness_for_duty).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Restrictions</CardTitle>
            <Heart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.restrictions).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => {
                const date = new Date(r.checkup_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No medical records found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <Heart className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {record.employee?.first_name} {record.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1 capitalize">
                        {record.checkup_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Checkup Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(record.checkup_date).toLocaleDateString()}
                    </span>
                  </div>
                  {record.blood_pressure && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">BP:</span>
                      <span className="text-sm font-medium">{record.blood_pressure}</span>
                    </div>
                  )}
                  {record.bmi && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">BMI:</span>
                      <span className="text-sm font-medium">{record.bmi}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fit for Duty:</span>
                    <Badge className={record.fitness_for_duty ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {record.fitness_for_duty ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {record.restrictions && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600"><strong>Restrictions:</strong> {record.restrictions}</p>
                    </div>
                  )}
                  {record.next_checkup_date && (
                    <div className="flex items-center justify-between text-blue-600">
                      <span className="text-sm">Next Checkup:</span>
                      <span className="text-sm font-medium">
                        {new Date(record.next_checkup_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(record)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_id">Employee *</Label>
                <select
                  id="employee_id"
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="checkup_date">Checkup Date *</Label>
                <Input
                  id="checkup_date"
                  type="date"
                  required
                  value={formData.checkup_date}
                  onChange={(e) => setFormData({ ...formData, checkup_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkup_type">Checkup Type *</Label>
                <select
                  id="checkup_type"
                  required
                  value={formData.checkup_type}
                  onChange={(e) => setFormData({ ...formData, checkup_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="annual_physical">Annual Physical</option>
                  <option value="pre_employment">Pre-Employment</option>
                  <option value="return_to_work">Return to Work</option>
                  <option value="occupational_health">Occupational Health</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="medical_provider">Medical Provider</Label>
                <Input
                  id="medical_provider"
                  value={formData.medical_provider}
                  onChange={(e) => setFormData({ ...formData, medical_provider: e.target.value })}
                  placeholder="Doctor/Clinic name"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="blood_pressure">Blood Pressure</Label>
                <Input
                  id="blood_pressure"
                  value={formData.blood_pressure}
                  onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                  placeholder="120/80"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                />
              </div>
              <div>
                <Label htmlFor="blood_type">Blood Type</Label>
                <select
                  id="blood_type"
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="List any allergies..."
              />
            </div>
            <div>
              <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
              <textarea
                id="chronic_conditions"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.chronic_conditions}
                onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                placeholder="List any chronic conditions..."
              />
            </div>
            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <textarea
                id="medications"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                placeholder="List current medications..."
              />
            </div>
            <div>
              <Label htmlFor="vaccinations">Vaccinations</Label>
              <Input
                id="vaccinations"
                value={formData.vaccinations}
                onChange={(e) => setFormData({ ...formData, vaccinations: e.target.value })}
                placeholder="Recent vaccinations..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="fitness_for_duty"
                  checked={formData.fitness_for_duty}
                  onChange={(e) => setFormData({ ...formData, fitness_for_duty: e.target.checked })}
                  className="w-4 h-4 text-[#008751] border-gray-300 rounded"
                />
                <Label htmlFor="fitness_for_duty" className="cursor-pointer">Fit for Duty</Label>
              </div>
              <div>
                <Label htmlFor="next_checkup_date">Next Checkup Date</Label>
                <Input
                  id="next_checkup_date"
                  type="date"
                  value={formData.next_checkup_date}
                  onChange={(e) => setFormData({ ...formData, next_checkup_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="restrictions">Work Restrictions</Label>
              <textarea
                id="restrictions"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.restrictions}
                onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                placeholder="Any work restrictions or limitations..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional medical notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingRecord ? 'Update' : 'Add'} Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
