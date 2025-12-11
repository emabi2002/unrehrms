'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  TrendingUp,
  Filter,
  CheckSquare,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  getAAPsByYear,
  getActiveFiscalYear,
  approveAAP,
  rejectAAP,
} from '@/lib/aap';
import type { AAPHeader } from '@/lib/aap-types';

export default function AAPApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [aaps, setAAPs] = useState<AAPHeader[]>([]);
  const [filteredAAPs, setFilteredAAPs] = useState<AAPHeader[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [selectedAAPs, setSelectedAAPs] = useState<Set<number>>(new Set());
  const [activeFiscalYear, setActiveFiscalYear] = useState<number>(2025);

  useEffect(() => {
    loadSubmittedAAPs();
  }, []);

  useEffect(() => {
    filterAAPs();
  }, [aaps, searchTerm, divisionFilter]);

  async function loadSubmittedAAPs() {
    try {
      setLoading(true);

      const activeYear = await getActiveFiscalYear();
      if (activeYear) {
        setActiveFiscalYear(activeYear.year_id);

        const aapData = await getAAPsByYear(activeYear.year_id);
        // Filter to only submitted AAPs
        const submittedAAPs = aapData.filter(aap => aap.status === 'Submitted');
        setAAPs(submittedAAPs);
      }
    } catch (error) {
      console.error('Error loading AAPs:', error);
      toast.error('Failed to load submitted AAPs');
    } finally {
      setLoading(false);
    }
  }

  function filterAAPs() {
    let filtered = [...aaps];

    if (searchTerm) {
      filtered = filtered.filter(aap =>
        aap.activity_project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.division?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.program?.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.manager?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (divisionFilter !== 'all') {
      filtered = filtered.filter(aap => aap.division?.code === divisionFilter);
    }

    setFilteredAAPs(filtered);
  }

  function toggleSelection(aapId: number) {
    const newSelection = new Set(selectedAAPs);
    if (newSelection.has(aapId)) {
      newSelection.delete(aapId);
    } else {
      newSelection.add(aapId);
    }
    setSelectedAAPs(newSelection);
  }

  function toggleSelectAll() {
    if (selectedAAPs.size === filteredAAPs.length) {
      setSelectedAAPs(new Set());
    } else {
      setSelectedAAPs(new Set(filteredAAPs.map(aap => aap.aap_id)));
    }
  }

  async function handleApprove(aapId: number) {
    try {
      setProcessing(true);
      await approveAAP(aapId, 'current-user-id'); // TODO: Get from auth
      toast.success('AAP approved successfully');
      await loadSubmittedAAPs(); // Reload
      setSelectedAAPs(new Set()); // Clear selection
    } catch (error) {
      console.error('Error approving AAP:', error);
      toast.error('Failed to approve AAP');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(aapId: number) {
    try {
      setProcessing(true);
      await rejectAAP(aapId);
      toast.success('AAP rejected');
      await loadSubmittedAAPs();
      setSelectedAAPs(new Set());
    } catch (error) {
      console.error('Error rejecting AAP:', error);
      toast.error('Failed to reject AAP');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkApprove() {
    if (selectedAAPs.size === 0) {
      toast.error('No AAPs selected');
      return;
    }

    try {
      setProcessing(true);

      for (const aapId of Array.from(selectedAAPs)) {
        await approveAAP(aapId, 'current-user-id');
      }

      toast.success(`${selectedAAPs.size} AAPs approved successfully`);
      await loadSubmittedAAPs();
      setSelectedAAPs(new Set());
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast.error('Failed to approve some AAPs');
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkReject() {
    if (selectedAAPs.size === 0) {
      toast.error('No AAPs selected');
      return;
    }

    try {
      setProcessing(true);

      for (const aapId of Array.from(selectedAAPs)) {
        await rejectAAP(aapId);
      }

      toast.success(`${selectedAAPs.size} AAPs rejected`);
      await loadSubmittedAAPs();
      setSelectedAAPs(new Set());
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      toast.error('Failed to reject some AAPs');
    } finally {
      setProcessing(false);
    }
  }

  const divisions = Array.from(new Set(aaps.map(aap => aap.division?.code).filter(Boolean)));

  const stats = {
    total: aaps.length,
    selected: selectedAAPs.size,
    totalProposed: aaps.reduce((sum, aap) => sum + (aap.total_proposed_cost || 0), 0),
    selectedProposed: filteredAAPs
      .filter(aap => selectedAAPs.has(aap.aap_id))
      .reduce((sum, aap) => sum + (aap.total_proposed_cost || 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AAP Approval Queue</h1>
        <p className="text-gray-600 mt-1">
          Fiscal Year {activeFiscalYear} - Review and approve submitted Annual Activity Plans
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Submitted AAPs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.selected}</div>
            <p className="text-xs text-gray-500 mt-1">For bulk action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              K{(stats.totalProposed / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500 mt-1">All pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Selected Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              K{(stats.selectedProposed / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500 mt-1">If approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by activity, division, program, or manager..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Divisions</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>

            {/* Bulk Actions */}
            {selectedAAPs.size > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve ({selectedAAPs.size})
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={processing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject ({selectedAAPs.size})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AAP List */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mb-4" />
              <p className="text-gray-600">Loading submitted AAPs...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredAAPs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {aaps.length === 0 ? 'No Pending AAPs' : 'No AAPs Match Your Filters'}
              </h3>
              <p className="text-gray-600">
                {aaps.length === 0
                  ? 'All AAPs have been reviewed. Great work!'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Submitted AAPs ({filteredAAPs.length})</CardTitle>
                <CardDescription>Click to review details or use bulk actions</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {selectedAAPs.size === filteredAAPs.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAAPs.map((aap) => (
                <div
                  key={aap.aap_id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedAAPs.has(aap.aap_id)
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedAAPs.has(aap.aap_id)}
                        onCheckedChange={() => toggleSelection(aap.aap_id)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
                        <span className="text-sm text-gray-500">{aap.division?.code}</span>
                      </div>

                      {/* Activity Info */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {aap.activity_project?.name || 'Untitled Activity'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {aap.activity_project?.code}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{aap.division?.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{aap.program?.program_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {aap.submitted_date
                              ? new Date(aap.submitted_date).toLocaleDateString()
                              : 'Recently'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-emerald-600">
                            K{aap.total_proposed_cost?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>

                      {/* Manager */}
                      {aap.manager && (
                        <p className="text-sm text-gray-500 mt-2">
                          Manager: {aap.manager}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Link href={`/dashboard/aap/${aap.aap_id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(aap.aap_id)}
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(aap.aap_id)}
                        disabled={processing}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      {aaps.length > 0 && (
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Review Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>When reviewing AAPs, check for:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Alignment with university strategic objectives</li>
                <li>Realistic budget estimates and justifications</li>
                <li>Clear outputs and targets</li>
                <li>Appropriate activity scheduling</li>
                <li>Correct program and activity classifications</li>
                <li>Complete contact information</li>
              </ul>
              <p className="text-xs text-blue-700 mt-4">
                <strong>Tip:</strong> Use bulk actions to approve multiple AAPs at once if they meet all criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
