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
import { Plus, Pencil, Trash2, ClipboardCheck, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SafetyAudit {
  id: string;
  audit_date: string;
  audit_type: string;
  audited_area: string;
  auditor_name: string;
  findings: string;
  compliance_score: number;
  non_compliance_items?: string;
  recommendations?: string;
  corrective_actions_required: boolean;
  corrective_actions?: string;
  follow_up_date?: string;
  status: string;
  created_at?: string;
}

export default function SafetyAuditsPage() {
  const [audits, setAudits] = useState<SafetyAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<SafetyAudit | null>(null);
  const [formData, setFormData] = useState({
    audit_date: new Date().toISOString().split('T')[0],
    audit_type: 'general_safety',
    audited_area: '',
    auditor_name: '',
    findings: '',
    compliance_score: '100',
    non_compliance_items: '',
    recommendations: '',
    corrective_actions_required: false,
    corrective_actions: '',
    follow_up_date: '',
    status: 'scheduled',
  });

  useEffect(() => {
    loadAudits();
  }, []);

  async function loadAudits() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('safety_audits')
        .select('*')
        .order('audit_date', { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error: any) {
      console.error('Error loading audits:', error);
      toast.error('Failed to load safety audits');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const auditData = {
        audit_date: formData.audit_date,
        audit_type: formData.audit_type,
        audited_area: formData.audited_area,
        auditor_name: formData.auditor_name,
        findings: formData.findings,
        compliance_score: parseInt(formData.compliance_score),
        non_compliance_items: formData.non_compliance_items || null,
        recommendations: formData.recommendations || null,
        corrective_actions_required: formData.corrective_actions_required,
        corrective_actions: formData.corrective_actions || null,
        follow_up_date: formData.follow_up_date || null,
        status: formData.status,
      };

      if (editingAudit) {
        const { error } = await supabase
          .from('safety_audits')
          .update(auditData)
          .eq('id', editingAudit.id);

        if (error) throw error;
        toast.success('Safety audit updated successfully');
      } else {
        const { error } = await supabase
          .from('safety_audits')
          .insert([auditData]);

        if (error) throw error;
        toast.success('Safety audit created successfully');
      }

      setDialogOpen(false);
      loadAudits();
      resetForm();
    } catch (error: any) {
      console.error('Error saving audit:', error);
      toast.error(error.message || 'Failed to save safety audit');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this safety audit?')) return;

    try {
      const { error } = await supabase
        .from('safety_audits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Safety audit deleted successfully');
      loadAudits();
    } catch (error: any) {
      console.error('Error deleting audit:', error);
      toast.error('Failed to delete safety audit');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingAudit(null);
    setDialogOpen(true);
  }

  function handleEdit(audit: SafetyAudit) {
    setEditingAudit(audit);
    setFormData({
      audit_date: audit.audit_date,
      audit_type: audit.audit_type,
      audited_area: audit.audited_area,
      auditor_name: audit.auditor_name,
      findings: audit.findings,
      compliance_score: audit.compliance_score.toString(),
      non_compliance_items: audit.non_compliance_items || '',
      recommendations: audit.recommendations || '',
      corrective_actions_required: audit.corrective_actions_required,
      corrective_actions: audit.corrective_actions || '',
      follow_up_date: audit.follow_up_date || '',
      status: audit.status,
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      audit_date: new Date().toISOString().split('T')[0],
      audit_type: 'general_safety',
      audited_area: '',
      auditor_name: '',
      findings: '',
      compliance_score: '100',
      non_compliance_items: '',
      recommendations: '',
      corrective_actions_required: false,
      corrective_actions: '',
      follow_up_date: '',
      status: 'scheduled',
    });
  }

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    follow_up_required: 'bg-orange-100 text-orange-800',
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Audits</h1>
          <p className="text-gray-600 mt-1">Conduct and track workplace safety audits</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Audit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.filter(a => a.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.length > 0
                ? Math.round(audits.reduce((sum, a) => sum + a.compliance_score, 0) / audits.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Required</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.filter(a => a.corrective_actions_required && a.status !== 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audits Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : audits.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No safety audits found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Schedule First Audit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <ClipboardCheck className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg capitalize">
                        {audit.audit_type.replace(/_/g, ' ')}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{audit.audited_area}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auditor:</span>
                    <span className="text-sm font-medium">{audit.auditor_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Compliance:</span>
                    <span className={`text-lg font-bold ${getComplianceColor(audit.compliance_score)}`}>
                      {audit.compliance_score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[audit.status]}>
                      {audit.status.replace('_', ' ').charAt(0).toUpperCase() + audit.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(audit.audit_date).toLocaleDateString()}
                    </span>
                  </div>
                  {audit.follow_up_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Follow-up:</span>
                      <span className="text-sm font-medium">
                        {new Date(audit.follow_up_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(audit)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(audit.id)}
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
              {editingAudit ? 'Edit Safety Audit' : 'Schedule Safety Audit'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audit_date">Audit Date *</Label>
                <Input
                  id="audit_date"
                  type="date"
                  required
                  value={formData.audit_date}
                  onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="audit_type">Audit Type *</Label>
                <select
                  id="audit_type"
                  required
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="general_safety">General Safety</option>
                  <option value="fire_safety">Fire Safety</option>
                  <option value="equipment">Equipment</option>
                  <option value="chemical_safety">Chemical Safety</option>
                  <option value="ppe_compliance">PPE Compliance</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audited_area">Audited Area *</Label>
                <Input
                  id="audited_area"
                  required
                  value={formData.audited_area}
                  onChange={(e) => setFormData({ ...formData, audited_area: e.target.value })}
                  placeholder="e.g., Production Floor A"
                />
              </div>
              <div>
                <Label htmlFor="auditor_name">Auditor Name *</Label>
                <Input
                  id="auditor_name"
                  required
                  value={formData.auditor_name}
                  onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                  placeholder="Name of auditor"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="compliance_score">Compliance Score (%) *</Label>
                <Input
                  id="compliance_score"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.compliance_score}
                  onChange={(e) => setFormData({ ...formData, compliance_score: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="follow_up_required">Follow-up Required</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="findings">Findings *</Label>
              <textarea
                id="findings"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.findings}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                placeholder="Key findings from the audit..."
              />
            </div>
            <div>
              <Label htmlFor="non_compliance_items">Non-Compliance Items</Label>
              <textarea
                id="non_compliance_items"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.non_compliance_items}
                onChange={(e) => setFormData({ ...formData, non_compliance_items: e.target.value })}
                placeholder="List items not in compliance..."
              />
            </div>
            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <textarea
                id="recommendations"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Recommendations for improvement..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="corrective_actions_required"
                  checked={formData.corrective_actions_required}
                  onChange={(e) => setFormData({ ...formData, corrective_actions_required: e.target.checked })}
                  className="w-4 h-4 text-[#008751] border-gray-300 rounded"
                />
                <Label htmlFor="corrective_actions_required" className="cursor-pointer">
                  Corrective Actions Required
                </Label>
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  disabled={!formData.corrective_actions_required}
                />
              </div>
            </div>
            {formData.corrective_actions_required && (
              <div>
                <Label htmlFor="corrective_actions">Corrective Actions</Label>
                <textarea
                  id="corrective_actions"
                  className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                  value={formData.corrective_actions}
                  onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                  placeholder="Specify corrective actions to be taken..."
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingAudit ? 'Update' : 'Schedule'} Audit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
