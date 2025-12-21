'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, Users, Mail, Phone, Linkedin, FileText, Calendar, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  linkedin_url?: string;
  source?: string;
  referred_by?: string;
  status: string;
  created_at: string;
  applications?: any[];
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    source: 'job_board',
    resume_url: '',
  });

  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    search: '',
  });

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadCandidates() {
    try {
      setLoading(true);
      let query = supabase
        .from('candidates')
        .select(`
          *,
          applications:applications(
            id,
            status,
            job_posting:job_postings(job_title)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }

      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }

  function openDialog(candidate?: Candidate) {
    if (candidate) {
      setEditingCandidate(candidate);
      setFormData({
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        email: candidate.email,
        phone: candidate.phone || '',
        linkedin_url: candidate.linkedin_url || '',
        source: candidate.source || 'job_board',
        resume_url: candidate.resume_url || '',
      });
    } else {
      setEditingCandidate(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        source: 'job_board',
        resume_url: '',
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null,
      linkedin_url: formData.linkedin_url || null,
      source: formData.source,
      resume_url: formData.resume_url || null,
      status: 'new',
    };

    try {
      if (editingCandidate) {
        const { error } = await supabase
          .from('candidates')
          .update(data)
          .eq('id', editingCandidate.id);

        if (error) throw error;
        toast.success('Candidate updated successfully');
      } else {
        const { error } = await supabase.from('candidates').insert([data]);

        if (error) throw error;
        toast.success('Candidate added successfully');
      }

      setDialogOpen(false);
      loadCandidates();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save candidate');
    }
  }

  async function updateStatus(candidateId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status: newStatus })
        .eq('id', candidateId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      loadCandidates();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  }

  async function handleDelete(candidate: Candidate) {
    if (!confirm(`Delete candidate "${candidate.first_name} ${candidate.last_name}"?`)) return;

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidate.id);

      if (error) throw error;

      toast.success('Candidate deleted successfully');
      loadCandidates();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete candidate');
    }
  }

  function viewCandidate(candidate: Candidate) {
    setSelectedCandidate(candidate);
    setViewDialogOpen(true);
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      new: <Badge className="bg-blue-600">New</Badge>,
      screening: <Badge className="bg-yellow-600">Screening</Badge>,
      interviewing: <Badge className="bg-orange-600">Interviewing</Badge>,
      offered: <Badge className="bg-purple-600">Offered</Badge>,
      hired: <Badge className="bg-green-600">Hired</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const stats = {
    total: candidates.length,
    new: candidates.filter((c) => c.status === 'new').length,
    screening: candidates.filter((c) => c.status === 'screening').length,
    interviewing: candidates.filter((c) => c.status === 'interviewing').length,
    offered: candidates.filter((c) => c.status === 'offered').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading candidates...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Candidate Database</h1>
          <p className="text-gray-600 mt-1">Applicant Tracking System (ATS)</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
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
              <p className="text-sm text-gray-600">New</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
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
              <p className="text-sm text-gray-600">Interviewing</p>
              <p className="text-3xl font-bold text-orange-600">{stats.interviewing}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Offered</p>
              <p className="text-3xl font-bold text-purple-600">{stats.offered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name or email..."
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
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                value={filters.source}
                onValueChange={(value) => setFilters({ ...filters, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="job_board">Job Board</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="direct">Direct Application</SelectItem>
                  <SelectItem value="career_fair">Career Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({ status: 'all', source: 'all', search: '' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Applications
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Added
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-green-700">
                            {candidate.first_name[0]}{candidate.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {candidate.first_name} {candidate.last_name}
                          </p>
                          {candidate.linkedin_url && (
                            <a
                              href={candidate.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="h-3 w-3" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className="capitalize">
                        {candidate.source?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {candidate.applications && candidate.applications.length > 0 ? (
                        <div className="text-center">
                          <span className="font-bold">{candidate.applications.length}</span>
                          <p className="text-xs text-gray-500">
                            {candidate.applications[0]?.job_posting?.job_title}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">No applications</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(candidate.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewCandidate(candidate)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(candidate)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(candidate)}
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

            {candidates.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No candidates found</p>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Candidate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
            <DialogDescription>
              {editingCandidate ? 'Update candidate details' : 'Add a new candidate to the system'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+675 7234 5678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source *</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_board">Job Board</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="direct">Direct Application</SelectItem>
                    <SelectItem value="career_fair">Career Fair</SelectItem>
                    <SelectItem value="headhunter">Headhunter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input
                id="resume_url"
                value={formData.resume_url}
                onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                placeholder="Link to resume/CV"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload resume to storage and paste URL here
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCandidate ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Candidate Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCandidate?.first_name} {selectedCandidate?.last_name}
            </DialogTitle>
            <DialogDescription>Candidate Profile</DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-6">
              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedCandidate.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStatus(selectedCandidate.id, status)}
                        className="capitalize"
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedCandidate.email}</span>
                  </div>
                  {selectedCandidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedCandidate.phone}</span>
                    </div>
                  )}
                  {selectedCandidate.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <a
                        href={selectedCandidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {selectedCandidate.resume_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <a
                        href={selectedCandidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume/CV
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Applications */}
              {selectedCandidate.applications && selectedCandidate.applications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCandidate.applications.map((app: any) => (
                        <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{app.job_posting?.job_title || 'Unknown Position'}</p>
                            <p className="text-sm text-gray-600">{getStatusBadge(app.status)}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/recruitment/applications/${app.id}`}>
                              View Application
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <Link href={`/dashboard/recruitment/interviews?candidate=${selectedCandidate.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => {
                  setViewDialogOpen(false);
                  openDialog(selectedCandidate);
                }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
