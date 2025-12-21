'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, Clock, Calendar, Users, Sun, Moon, Pencil, Trash2 } from 'lucide-react';

interface Shift {
  id: string;
  shift_code: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  is_active: boolean;
}

export default function ShiftsManagementPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    shift_code: '',
    shift_name: '',
    start_time: '',
    end_time: '',
    break_duration_minutes: 60,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadShifts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('shift_code');

      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }

  function openDialog(shift?: Shift) {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        shift_code: shift.shift_code,
        shift_name: shift.shift_name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        break_duration_minutes: shift.break_duration_minutes,
        monday: shift.monday,
        tuesday: shift.tuesday,
        wednesday: shift.wednesday,
        thursday: shift.thursday,
        friday: shift.friday,
        saturday: shift.saturday,
        sunday: shift.sunday,
      });
    } else {
      setEditingShift(null);
      setFormData({
        shift_code: '',
        shift_name: '',
        start_time: '08:00',
        end_time: '17:00',
        break_duration_minutes: 60,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      shift_code: formData.shift_code,
      shift_name: formData.shift_name,
      start_time: formData.start_time,
      end_time: formData.end_time,
      break_duration_minutes: formData.break_duration_minutes,
      monday: formData.monday,
      tuesday: formData.tuesday,
      wednesday: formData.wednesday,
      thursday: formData.thursday,
      friday: formData.friday,
      saturday: formData.saturday,
      sunday: formData.sunday,
      is_active: true,
    };

    try {
      if (editingShift) {
        const { error } = await supabase
          .from('shifts')
          .update(data)
          .eq('id', editingShift.id);

        if (error) throw error;
        toast.success('Shift updated successfully');
      } else {
        const { error } = await supabase.from('shifts').insert([data]);

        if (error) throw error;
        toast.success('Shift created successfully');
      }

      setDialogOpen(false);
      loadShifts();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save shift');
    }
  }

  async function handleDelete(shift: Shift) {
    if (!confirm(`Delete shift "${shift.shift_name}"?`)) return;

    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shift.id);

      if (error) throw error;

      toast.success('Shift deleted successfully');
      loadShifts();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete shift');
    }
  }

  async function toggleActive(shiftId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ is_active: !isActive })
        .eq('id', shiftId);

      if (error) throw error;

      toast.success(isActive ? 'Shift deactivated' : 'Shift activated');
      loadShifts();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update shift');
    }
  }

  function calculateWorkingHours(startTime: string, endTime: string, breakMinutes: number): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    const workingMinutes = endTotalMin - startTotalMin - breakMinutes;
    return Math.round((workingMinutes / 60) * 10) / 10;
  }

  function getDaysString(shift: Shift): string {
    const days = [];
    if (shift.monday) days.push('Mon');
    if (shift.tuesday) days.push('Tue');
    if (shift.wednesday) days.push('Wed');
    if (shift.thursday) days.push('Thu');
    if (shift.friday) days.push('Fri');
    if (shift.saturday) days.push('Sat');
    if (shift.sunday) days.push('Sun');
    return days.join(', ');
  }

  const getShiftTypeIcon = (shift: Shift) => {
    const startHour = parseInt(shift.start_time.split(':')[0]);
    if (startHour >= 22 || startHour < 6) {
      return <Moon className="h-5 w-5 text-blue-600" />;
    }
    return <Sun className="h-5 w-5 text-yellow-600" />;
  };

  const stats = {
    total: shifts.length,
    active: shifts.filter((s) => s.is_active).length,
    weekday: shifts.filter((s) => s.monday && s.friday && !s.saturday && !s.sunday).length,
    weekend: shifts.filter((s) => s.saturday || s.sunday).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading shifts...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-gray-600 mt-1">Configure work shifts and schedules</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Shift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Shifts</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekday Shifts</p>
                <p className="text-2xl font-bold">{stats.weekday}</p>
              </div>
              <Sun className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekend Shifts</p>
                <p className="text-2xl font-bold">{stats.weekend}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => (
          <Card key={shift.id} className={`hover:shadow-lg transition-shadow ${!shift.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {getShiftTypeIcon(shift)}
                  <div>
                    <CardTitle className="text-lg">{shift.shift_name}</CardTitle>
                    <p className="text-sm text-gray-600">{shift.shift_code}</p>
                  </div>
                </div>
                {shift.is_active ? (
                  <Badge className="bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Time Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Start Time</p>
                  <p className="font-bold text-lg">{shift.start_time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">End Time</p>
                  <p className="font-bold text-lg">{shift.end_time}</p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Break</p>
                    <p className="font-medium">{shift.break_duration_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Working Hours</p>
                    <p className="font-medium">
                      {calculateWorkingHours(
                        shift.start_time,
                        shift.end_time,
                        shift.break_duration_minutes
                      )} hrs
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Working Days</p>
                <div className="flex flex-wrap gap-1">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const isActive = shift[day as keyof Shift] as boolean;
                    return (
                      <Badge
                        key={day}
                        variant={isActive ? 'default' : 'outline'}
                        className={`text-xs ${!isActive ? 'opacity-40' : ''}`}
                      >
                        {day.slice(0, 3).toUpperCase()}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openDialog(shift)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(shift.id, shift.is_active)}
                >
                  {shift.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(shift)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shifts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No shifts configured</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Shift
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift_code">Shift Code *</Label>
                <Input
                  id="shift_code"
                  value={formData.shift_code}
                  onChange={(e) => setFormData({ ...formData, shift_code: e.target.value })}
                  required
                  placeholder="e.g., DAY-1, NIGHT-1"
                />
              </div>

              <div>
                <Label htmlFor="shift_name">Shift Name *</Label>
                <Input
                  id="shift_name"
                  value={formData.shift_name}
                  onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })}
                  required
                  placeholder="e.g., Day Shift, Night Shift"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="break_duration_minutes">Break (minutes)</Label>
                <Input
                  id="break_duration_minutes"
                  type="number"
                  min="0"
                  value={formData.break_duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, break_duration_minutes: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Working Days *</Label>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { key: 'monday', label: 'Mon' },
                  { key: 'tuesday', label: 'Tue' },
                  { key: 'wednesday', label: 'Wed' },
                  { key: 'thursday', label: 'Thu' },
                  { key: 'friday', label: 'Fri' },
                  { key: 'saturday', label: 'Sat' },
                  { key: 'sunday', label: 'Sun' },
                ].map((day) => (
                  <div key={day.key} className="flex flex-col items-center">
                    <input
                      type="checkbox"
                      id={day.key}
                      checked={formData[day.key as keyof typeof formData] as boolean}
                      onChange={(e) =>
                        setFormData({ ...formData, [day.key]: e.target.checked })
                      }
                      className="h-4 w-4 mb-1"
                    />
                    <Label htmlFor={day.key} className="text-xs cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Shift Preview</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Time:</span> {formData.start_time} - {formData.end_time}
                </div>
                <div>
                  <span className="font-medium">Working Hours:</span>{' '}
                  {formData.start_time && formData.end_time
                    ? calculateWorkingHours(
                        formData.start_time,
                        formData.end_time,
                        formData.break_duration_minutes
                      )
                    : '0'}{' '}
                  hours
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingShift ? 'Update Shift' : 'Create Shift'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
