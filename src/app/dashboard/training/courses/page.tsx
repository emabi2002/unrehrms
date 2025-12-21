'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, Book, Clock, DollarSign, Users, Pencil, Trash2 } from 'lucide-react';

interface TrainingCourse {
  id: string;
  course_code: string;
  course_name: string;
  course_description?: string;
  course_category?: string;
  duration_hours?: number;
  delivery_method?: string;
  provider_type: string;
  provider_name?: string;
  cost_per_person?: number;
  currency: string;
  certification_provided: boolean;
  is_active: boolean;
}

export default function TrainingCoursesPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    course_description: '',
    course_category: 'technical',
    duration_hours: '',
    delivery_method: 'classroom',
    provider_type: 'internal',
    provider_name: '',
    cost_per_person: '',
    certification_provided: false,
  });

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_courses')
        .select('*')
        .order('course_name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  function openDialog(course?: TrainingCourse) {
    if (course) {
      setEditingCourse(course);
      setFormData({
        course_code: course.course_code,
        course_name: course.course_name,
        course_description: course.course_description || '',
        course_category: course.course_category || 'technical',
        duration_hours: course.duration_hours?.toString() || '',
        delivery_method: course.delivery_method || 'classroom',
        provider_type: course.provider_type,
        provider_name: course.provider_name || '',
        cost_per_person: course.cost_per_person?.toString() || '',
        certification_provided: course.certification_provided,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        course_code: '',
        course_name: '',
        course_description: '',
        course_category: 'technical',
        duration_hours: '',
        delivery_method: 'classroom',
        provider_type: 'internal',
        provider_name: '',
        cost_per_person: '',
        certification_provided: false,
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      course_code: formData.course_code,
      course_name: formData.course_name,
      course_description: formData.course_description || null,
      course_category: formData.course_category,
      duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : null,
      delivery_method: formData.delivery_method,
      provider_type: formData.provider_type,
      provider_name: formData.provider_name || null,
      cost_per_person: formData.cost_per_person ? parseFloat(formData.cost_per_person) : null,
      currency: 'PGK',
      certification_provided: formData.certification_provided,
      is_active: true,
    };

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('training_courses')
          .update(data)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast.success('Course updated successfully');
      } else {
        const { error } = await supabase.from('training_courses').insert([data]);

        if (error) throw error;
        toast.success('Course created successfully');
      }

      setDialogOpen(false);
      loadCourses();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save course');
    }
  }

  async function handleDelete(course: TrainingCourse) {
    if (!confirm(`Delete course "${course.course_name}"?`)) return;

    try {
      const { error } = await supabase
        .from('training_courses')
        .delete()
        .eq('id', course.id);

      if (error) throw error;

      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  }

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.is_active).length,
    internal: courses.filter((c) => c.provider_type === 'internal').length,
    certified: courses.filter((c) => c.certification_provided).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Courses</h1>
          <p className="text-gray-600 mt-1">Manage your training catalog</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Book className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Internal Courses</p>
                <p className="text-2xl font-bold">{stats.internal}</p>
              </div>
              <Book className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Certification</p>
                <p className="text-2xl font-bold">{stats.certified}</p>
              </div>
              <Book className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.course_name}</CardTitle>
                  <p className="text-sm text-gray-600">{course.course_code}</p>
                </div>
                {course.is_active ? (
                  <Badge className="bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.course_description && (
                <p className="text-sm text-gray-600 line-clamp-2">{course.course_description}</p>
              )}

              <div className="space-y-2 text-sm">
                {course.course_category && (
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline">{course.course_category}</Badge>
                  </div>
                )}

                {course.duration_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                )}

                {course.delivery_method && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="capitalize">{course.delivery_method}</span>
                  </div>
                )}

                {course.cost_per_person && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>
                      {course.currency} {course.cost_per_person.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant={course.provider_type === 'internal' ? 'default' : 'secondary'}>
                    {course.provider_type === 'internal' ? 'Internal' : 'External'}
                  </Badge>
                  {course.certification_provided && (
                    <Badge className="bg-purple-600">Certificate</Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openDialog(course)}>
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(course)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No training courses found</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Course
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_code">Course Code *</Label>
                <Input
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  required
                  placeholder="e.g., TRN-001"
                />
              </div>

              <div>
                <Label htmlFor="course_category">Category *</Label>
                <Select
                  value={formData.course_category}
                  onValueChange={(value) => setFormData({ ...formData, course_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="soft_skills">Soft Skills</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="course_name">Course Name *</Label>
              <Input
                id="course_name"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                required
                placeholder="e.g., Advanced Excel Training"
              />
            </div>

            <div>
              <Label htmlFor="course_description">Description</Label>
              <textarea
                id="course_description"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                value={formData.course_description}
                onChange={(e) => setFormData({ ...formData, course_description: e.target.value })}
                placeholder="Course overview and objectives..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_hours">Duration (Hours)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  step="0.5"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  placeholder="8"
                />
              </div>

              <div>
                <Label htmlFor="delivery_method">Delivery Method *</Label>
                <Select
                  value={formData.delivery_method}
                  onValueChange={(value) => setFormData({ ...formData, delivery_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="blended">Blended</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider_type">Provider Type *</Label>
                <Select
                  value={formData.provider_type}
                  onValueChange={(value) => setFormData({ ...formData, provider_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="provider_name">Provider Name</Label>
                <Input
                  id="provider_name"
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  placeholder="e.g., Training Consultant Ltd"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_per_person">Cost Per Person (PGK)</Label>
                <Input
                  id="cost_per_person"
                  type="number"
                  value={formData.cost_per_person}
                  onChange={(e) => setFormData({ ...formData, cost_per_person: e.target.value })}
                  placeholder="500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="certification_provided"
                  checked={formData.certification_provided}
                  onChange={(e) =>
                    setFormData({ ...formData, certification_provided: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="certification_provided" className="cursor-pointer">
                  Certification Provided
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingCourse ? 'Update Course' : 'Create Course'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
