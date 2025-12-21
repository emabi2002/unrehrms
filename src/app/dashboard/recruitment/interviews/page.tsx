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
import { Plus, Calendar, Video, Users, MapPin, Star, CheckCircle, XCircle, Clock, Pencil, Trash2 } from 'lucide-react';

interface Interview {
  id: string;
  application_id: string;
  application?: {
    candidate?: {
      first_name: string;
      last_name: string;
    };
    job_posting?: {
      job_title: string;
    };
  };
  candidate_id: string;
  interview_type: string;
  interview_date: string;
  location?: string;
  meeting_link?: string;
  interviewers?: string[];
  technical_score?: number;
  communication_score?: number;
  cultural_fit_score?: number;
  overall_score?: number;
  interviewer_notes?: string;
  recommendation?: string;
  status: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [evaluateDialogOpen, setEvaluateDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    application_id: '',
    interview_type: 'in_person',
    interview_date: '',
    interview_time: '',
    location: '',
    meeting_link: '',
    interviewers: [] as string[],
  });

  const [evaluationData, setEvaluationData] = useState({
    technical_score: '',
    communication_score: '',
    cultural_fit_score: '',
    interviewer_notes: '',
    recommendation: 'maybe',
  });

  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    date: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadData() {
    try {
      setLoading(true);
      let query = supabase
        .from('interviews')
        .select(`
          *,
          application:applications(
            candidate:candidates(first_name, last_name),
            job_posting:job_postings(job_title)
          )
        `)
        .order('interview_date', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.type !== 'all') {
        query = query.eq('interview_type', filters.type);
      }

      if (filters.date) {
        query = query.gte('interview_date', filters.date);
      }

      const [interviewsRes, appsRes, empsRes] = await Promise.all([
        query,
        supabase.from('applications').select(`
          id,
          candidate:candidates(first_name, last_name),
          job_posting:job_postings(job_title)
        `).in('status', ['screening', 'shortlisted', 'interviewing']),
        supabase.from('employees').select('id, first_name, last_name, department').eq('status', 'active'),
      ]);

      if (interviewsRes.data) setInterviews(interviewsRes.data);
      if (appsRes.data) setApplications(appsRes.data);
      if (empsRes.data) setEmployees(empsRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Get candidate_id from application
    const app = applications.find(a => a.id === formData.application_id);
    if (!app) {
      toast.error('Application not found');
      return;
    }

    const data = {
      application_id: formData.application_id,
      candidate_id: app.candidate?.id || '',
      interview_type: formData.interview_type,
      interview_date: `${formData.interview_date}T${formData.interview_time}:00`,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      interviewers: formData.interviewers.length > 0 ? formData.interviewers : null,
      status: 'scheduled',
    };

    try {
      const { error } = await supabase.from('interviews').insert([data]);

      if (error) throw error;

      // Update application status
      await supabase
        .from('applications')
        .update({ status: 'interviewing' })
        .eq('id', formData.application_id);

      toast.success('Interview scheduled successfully');
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to schedule interview');
    }
  }

  async function handleEvaluationSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedInterview) return;

    const technical = parseInt(evaluationData.technical_score) || 0;
    const communication = parseInt(evaluationData.communication_score) || 0;
    const cultural = parseInt(evaluationData.cultural_fit_score) || 0;
    const overall = Math.round((technical + communication + cultural) / 3);

    const data = {
      technical_score: technical,
      communication_score: communication,
      cultural_fit_score: cultural,
      overall_score: overall,
      interviewer_notes: evaluationData.interviewer_notes,
      recommendation: evaluationData.recommendation,
      status: 'completed',
    };

    try {
      const { error } = await supabase
        .from('interviews')
        .update(data)
        .eq('id', selectedInterview.id);

      if (error) throw error;

      toast.success('Interview evaluation saved');
      setEvaluateDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save evaluation');
    }
  }

  async function updateStatus(interviewId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status: newStatus })
        .eq('id', interviewId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  }

  async function handleDelete(interview: Interview) {
    if (!confirm('Delete this interview? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interview.id);

      if (error) throw error;

      toast.success('Interview deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete interview');
    }
  }

  function openEvaluateDialog(interview: Interview) {
    setSelectedInterview(interview);
    setEvaluationData({
      technical_score: interview.technical_score?.toString() || '',
      communication_score: interview.communication_score?.toString() || '',
      cultural_fit_score: interview.cultural_fit_score?.toString() || '',
      interviewer_notes: interview.interviewer_notes || '',
      recommendation: interview.recommendation || 'maybe',
    });
    setEvaluateDialogOpen(true);
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      scheduled: <Badge className="bg-blue-600">Scheduled</Badge>,
      completed: <Badge className="bg-green-600">Completed</Badge>,
      cancelled: <Badge variant="destructive">Cancelled</Badge>,
      no_show: <Badge variant="outline" className="border-red-600 text-red-700">No Show</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const getRecommendationBadge = (recommendation?: string) => {
    const badges: any = {
      strong_yes: <Badge className="bg-green-700">Strong Yes</Badge>,
      yes: <Badge className="bg-green-600">Yes</Badge>,
      maybe: <Badge className="bg-yellow-600">Maybe</Badge>,
      no: <Badge variant="destructive">No</Badge>,
      strong_no: <Badge className="bg-red-700">Strong No</Badge>,
    };
    return recommendation ? badges[recommendation] : null;
  };

  const getTypeIcon = (type: string) => {
    const icons: any = {
      phone: <Calendar className="h-4 w-4 text-blue-600" />,
      video: <Video className="h-4 w-4 text-purple-600" />,
      in_person: <MapPin className="h-4 w-4 text-green-600" />,
      panel: <Users className="h-4 w-4 text-orange-600" />,
    };
    return icons[type] || <Calendar className="h-4 w-4" />;
  };

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter((i) => i.status === 'scheduled').length,
    completed: interviews.filter((i) => i.status === 'completed').length,
    avgScore: interviews.filter(i => i.overall_score).length > 0
      ? Math.round(
          interviews.filter(i => i.overall_score).reduce((sum, i) => sum + (i.overall_score || 0), 0) /
          interviews.filter(i => i.overall_score).length
        )
      : 0,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading interviews...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interview Scheduling</h1>
          <p className="text-gray-600 mt-1">Schedule and evaluate candidate interviews</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}/100</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Interview Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">From Date</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({ status: 'all', type: 'all', date: '' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <div className="space-y-4">
        {interviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(interview.interview_type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {interview.application?.candidate?.first_name}{' '}
                        {interview.application?.candidate?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {interview.application?.job_posting?.job_title}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {new Date(interview.interview_date).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Type</p>
                      <Badge variant="outline" className="capitalize">
                        {interview.interview_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    {interview.location && (
                      <div>
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="font-medium text-sm">{interview.location}</p>
                      </div>
                    )}

                    {interview.meeting_link && (
                      <div>
                        <p className="text-xs text-gray-600">Meeting</p>
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Join Link
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Scores */}
                  {interview.overall_score && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Technical</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-bold">{interview.technical_score}/100</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Communication</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-bold">{interview.communication_score}/100</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Cultural Fit</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-bold">{interview.cultural_fit_score}/100</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Overall</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-bold text-lg">{interview.overall_score}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {getStatusBadge(interview.status)}
                    {getRecommendationBadge(interview.recommendation)}
                  </div>
                </div>

                <div className="flex gap-2">
                  {interview.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEvaluateDialog(interview)}
                    >
                      Evaluate
                    </Button>
                  )}
                  {interview.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEvaluateDialog(interview)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(interview)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {interviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No interviews scheduled</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule First Interview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule Interview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Interview</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="application_id">Application *</Label>
              <Select
                value={formData.application_id}
                onValueChange={(value) => setFormData({ ...formData, application_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.candidate?.first_name} {app.candidate?.last_name} -{' '}
                      {app.job_posting?.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview_type">Interview Type *</Label>
                <Select
                  value={formData.interview_type}
                  onValueChange={(value) => setFormData({ ...formData, interview_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Interview</SelectItem>
                    <SelectItem value="video">Video Interview</SelectItem>
                    <SelectItem value="in_person">In-Person Interview</SelectItem>
                    <SelectItem value="panel">Panel Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interview_date">Date *</Label>
                <Input
                  id="interview_date"
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interview_time">Time *</Label>
              <Input
                id="interview_time"
                type="time"
                value={formData.interview_time}
                onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
                required
              />
            </div>

            {(formData.interview_type === 'in_person' || formData.interview_type === 'panel') && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Conference Room A, HR Office"
                />
              </div>
            )}

            {(formData.interview_type === 'video' || formData.interview_type === 'phone') && (
              <div>
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="e.g., Zoom/Teams link"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Interview</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Evaluate Interview Dialog */}
      <Dialog open={evaluateDialogOpen} onOpenChange={setEvaluateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Interview Evaluation</DialogTitle>
          </DialogHeader>

          {selectedInterview && (
            <form onSubmit={handleEvaluationSubmit} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium">
                  {selectedInterview.application?.candidate?.first_name}{' '}
                  {selectedInterview.application?.candidate?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedInterview.application?.job_posting?.job_title}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="technical_score">Technical Skills (0-100)</Label>
                  <Input
                    id="technical_score"
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.technical_score}
                    onChange={(e) =>
                      setEvaluationData({ ...evaluationData, technical_score: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="communication_score">Communication (0-100)</Label>
                  <Input
                    id="communication_score"
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.communication_score}
                    onChange={(e) =>
                      setEvaluationData({ ...evaluationData, communication_score: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cultural_fit_score">Cultural Fit (0-100)</Label>
                  <Input
                    id="cultural_fit_score"
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.cultural_fit_score}
                    onChange={(e) =>
                      setEvaluationData({ ...evaluationData, cultural_fit_score: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="interviewer_notes">Interview Notes</Label>
                <textarea
                  id="interviewer_notes"
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                  value={evaluationData.interviewer_notes}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, interviewer_notes: e.target.value })
                  }
                  placeholder="Detailed observations, strengths, weaknesses..."
                />
              </div>

              <div>
                <Label htmlFor="recommendation">Recommendation</Label>
                <Select
                  value={evaluationData.recommendation}
                  onValueChange={(value) =>
                    setEvaluationData({ ...evaluationData, recommendation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strong_yes">Strong Yes - Highly Recommend</SelectItem>
                    <SelectItem value="yes">Yes - Recommend</SelectItem>
                    <SelectItem value="maybe">Maybe - Further Assessment Needed</SelectItem>
                    <SelectItem value="no">No - Do Not Recommend</SelectItem>
                    <SelectItem value="strong_no">Strong No - Definitely Not</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEvaluateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Evaluation</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
