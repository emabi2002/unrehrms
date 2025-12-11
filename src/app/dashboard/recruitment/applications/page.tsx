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
import { Plus, FileText, Star, Calendar, Eye, Pencil, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  job_posting_id: string;
  job_posting?: {
    job_title: string;
    position?: { position_title: string };
  };
  candidate_id: string;
  candidate?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    resume_url?: string;
  };
  application_date: string;
  cover_letter?: string;
  screening_score?: number;
  screening_notes?: string;
  status: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    candidate_id: '',
    job_posting_id: '',
    cover_letter: '',
  });

  const [filters, setFilters] = useState({
    status: 'all',
    job_posting: 'all',
    search: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadData() {
    try {
      setLoading(true);
      let query = supabase
        .from('applications')
        .select(`
          *,
          candidate:candidates(
            first_name,
            last_name,
            email,
            phone,
            resume_url
          ),
          job_posting:job_postings(
            job_title,
            position:positions(position_title)
          )
        `)
        .order('application_date', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.job_posting !== 'all') {
        query = query.eq('job_posting_id', filters.job_posting);
      }

      const [appsRes, candidatesRes, postingsRes] = await Promise.all([
        query,
        supabase.from('candidates').select('id, first_name, last_name, email'),
        supabase.from('job_postings').select('id, job_title, position:positions(position_title)').eq('status', 'active'),
      ]);

      if (appsRes.data) setApplications(appsRes.data);
      if (candidatesRes.data) setCandidates(candidatesRes.data);
      if (postingsRes.data) setJobPostings(postingsRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      candidate_id: formData.candidate_id,
      job_posting_id: formData.job_posting_id,
      cover_letter: formData.cover_letter || null,
      application_date: new Date().toISOString().split('T')[0],
      status: 'applied',
    };

    try {
      const { error } = await supabase.from('applications').insert([data]);

      if (error) throw error;

      toast.success('Application submitted successfully');
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to submit application');
    }
  }

  async function updateStatus(appId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      // Also update candidate status
      const app = applications.find(a => a.id === appId);
      if (app) {
        await supabase
          .from('candidates')
          .update({ status: newStatus === 'shortlisted' ? 'screening' : newStatus })
          .eq('id', app.candidate_id);
      }

      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  }

  async function updateScreeningScore(appId: string, score: number, notes: string) {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          screening_score: score,
          screening_notes: notes,
        })
        .eq('id', appId);

      if (error) throw error;

      toast.success('Screening assessment saved');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save screening');
    }
  }

  async function handleDelete(application: Application) {
    if (!confirm('Delete this application? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id);

      if (error) throw error;

      toast.success('Application deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete application');
    }
  }

  function viewApplication(application: Application) {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      applied: <Badge className="bg-blue-600">Applied</Badge>,
      screening: <Badge className="bg-yellow-600">Screening</Badge>,
      shortlisted: <Badge className="bg-purple-600">Shortlisted</Badge>,
      interviewing: <Badge className="bg-orange-600">Interviewing</Badge>,
      offered: <Badge className="bg-green-600">Offered</Badge>,
      hired: <Badge className="bg-green-700">Hired</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    screening: applications.filter((a) => a.status === 'screening').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interviewing: applications.filter((a) => a.status === 'interviewing').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading applications...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Applications Management</h1>
          <p className="text-gray-600 mt-1">Track and manage candidate applications</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-3xl font-bold text-blue-600">{stats.applied}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Screening</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.screening}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Shortlisted</p>
              <p className="text-3xl font-bold text-purple-600">{stats.shortlisted}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Interviewing</p>
              <p className="text-3xl font-bold text-orange-600">{stats.interviewing}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search Candidate</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

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
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="job_posting">Job Posting</Label>
              <Select
                value={filters.job_posting}
                onValueChange={(value) => setFilters({ ...filters, job_posting: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {jobPostings.map((posting) => (
                    <SelectItem key={posting.id} value={posting.id}>
                      {posting.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Applied Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Screening Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {app.candidate?.first_name} {app.candidate?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{app.candidate?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{app.job_posting?.job_title}</p>
                        {app.job_posting?.position && (
                          <p className="text-xs text-gray-600">
                            {app.job_posting.position.position_title}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(app.application_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {app.screening_score ? (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{app.screening_score}/100</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not screened</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(app.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewApplication(app)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(app)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {applications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No applications found</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit First Application
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit New Application</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="job_posting_id">Job Posting *</Label>
              <Select
                value={formData.job_posting_id}
                onValueChange={(value) => setFormData({ ...formData, job_posting_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {jobPostings.map((posting) => (
                    <SelectItem key={posting.id} value={posting.id}>
                      {posting.job_title}
                      {posting.position && ` - ${posting.position.position_title}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="candidate_id">Candidate *</Label>
              <Select
                value={formData.candidate_id}
                onValueChange={(value) => setFormData({ ...formData, candidate_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.first_name} {candidate.last_name} ({candidate.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cover_letter">Cover Letter</Label>
              <textarea
                id="cover_letter"
                className="w-full min-h-[120px] px-3 py-2 border rounded-md"
                value={formData.cover_letter}
                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                placeholder="Why are you interested in this position?..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View/Edit Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidate Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedApplication.candidate?.first_name}{' '}
                        {selectedApplication.candidate?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.candidate?.email}</p>
                    </div>
                    {selectedApplication.candidate?.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedApplication.candidate.phone}</p>
                      </div>
                    )}
                    {selectedApplication.candidate?.resume_url && (
                      <div>
                        <p className="text-sm text-gray-600">Resume</p>
                        <a
                          href={selectedApplication.candidate.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Position Applied For</p>
                    <p className="font-medium text-lg">
                      {selectedApplication.job_posting?.job_title}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Application Date</p>
                    <p className="font-medium">
                      {new Date(selectedApplication.application_date).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedApplication.cover_letter && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Cover Letter</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedApplication.cover_letter}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Screening Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Screening Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="screening_score">Screening Score (0-100)</Label>
                    <Input
                      id="screening_score"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={selectedApplication.screening_score || ''}
                      onBlur={(e) => {
                        const score = parseInt(e.target.value);
                        if (score >= 0 && score <= 100) {
                          updateScreeningScore(
                            selectedApplication.id,
                            score,
                            selectedApplication.screening_notes || ''
                          );
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="screening_notes">Screening Notes</Label>
                    <textarea
                      id="screening_notes"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      defaultValue={selectedApplication.screening_notes || ''}
                      onBlur={(e) => {
                        updateScreeningScore(
                          selectedApplication.id,
                          selectedApplication.screening_score || 0,
                          e.target.value
                        );
                      }}
                      placeholder="Assessment notes, qualifications match, etc..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {['applied', 'screening', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected'].map(
                      (status) => (
                        <Button
                          key={status}
                          variant={selectedApplication.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateStatus(selectedApplication.id, status)}
                          className="capitalize"
                        >
                          {status === 'shortlisted' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                          {status}
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <Link
                    href={`/dashboard/recruitment/interviews?application=${selectedApplication.id}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/recruitment/candidates?id=${selectedApplication.candidate_id}`}>
                    View Candidate Profile
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
