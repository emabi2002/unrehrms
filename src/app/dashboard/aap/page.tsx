'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getAAPsByYear, getActiveFiscalYear } from '@/lib/aap';
import type { AAPHeader, AAPStatus } from '@/lib/aap-types';
import { toast } from 'sonner';

export default function AAPManagementPage() {
  const [loading, setLoading] = useState(true);
  const [aaps, setAAPs] = useState<AAPHeader[]>([]);
  const [filteredAAPs, setFilteredAAPs] = useState<AAPHeader[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [activeFiscalYear, setActiveFiscalYear] = useState<number>(2025);

  useEffect(() => {
    loadAAPs();
  }, []);

  useEffect(() => {
    filterAAPs();
  }, [aaps, searchTerm, statusFilter, divisionFilter]);

  async function loadAAPs() {
    try {
      setLoading(true);

      // Get active fiscal year
      const activeYear = await getActiveFiscalYear();
      if (activeYear) {
        setActiveFiscalYear(activeYear.year_id);

        // Get AAPs for active year
        const aapData = await getAAPsByYear(activeYear.year_id);
        setAAPs(aapData);
      }
    } catch (error) {
      console.error('Error loading AAPs:', error);
      toast.error('Failed to load AAPs. Please execute the database schema first.');
    } finally {
      setLoading(false);
    }
  }

  function filterAAPs() {
    let filtered = [...aaps];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(aap =>
        aap.activity_project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.division?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.program?.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aap.manager?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(aap => aap.status === statusFilter);
    }

    // Division filter
    if (divisionFilter !== 'all') {
      filtered = filtered.filter(aap => aap.division?.code === divisionFilter);
    }

    setFilteredAAPs(filtered);
  }

  function getStatusColor(status: AAPStatus) {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusIcon(status: AAPStatus) {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Submitted':
        return <Clock className="w-4 h-4" />;
      case 'Draft':
        return <Edit className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  }

  // Get unique divisions for filter
  const divisions = Array.from(new Set(aaps.map(aap => aap.division?.code).filter(Boolean)));

  // Calculate statistics
  const stats = {
    total: aaps.length,
    draft: aaps.filter(a => a.status === 'Draft').length,
    submitted: aaps.filter(a => a.status === 'Submitted').length,
    approved: aaps.filter(a => a.status === 'Approved').length,
    totalProposed: aaps.reduce((sum, a) => sum + (a.total_proposed_cost || 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Annual Activity Plans (AAP)</h1>
          <p className="text-gray-600 mt-1">
            Fiscal Year {activeFiscalYear} - Manage department activity plans and budgets
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/aap/approvals">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approval Queue
              {stats.submitted > 0 && (
                <Badge className="ml-2 bg-blue-500">{stats.submitted}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/aap/new">
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
              <Plus className="w-4 h-4 mr-2" />
              Create New AAP
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total AAPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">This fiscal year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
            <p className="text-xs text-gray-500 mt-1">In preparation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Proposed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              K{(stats.totalProposed / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500 mt-1">Proposed budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

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
          </div>
        </CardContent>
      </Card>

      {/* AAP List */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">Loading AAPs...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredAAPs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {aaps.length === 0 ? 'No AAPs Created Yet' : 'No AAPs Match Your Filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {aaps.length === 0
                  ? 'Create your first Annual Activity Plan to get started.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {aaps.length === 0 && (
                <Link href="/dashboard/aap/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First AAP
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Annual Activity Plans ({filteredAAPs.length})</CardTitle>
            <CardDescription>
              Click on any AAP to view details or continue editing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAAPs.map((aap) => (
                <div
                  key={aap.aap_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(aap.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(aap.status)}
                            {aap.status}
                          </span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {aap.division?.code}
                        </span>
                      </div>

                      {/* Activity Info */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {aap.activity_project?.name || 'Untitled Activity'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {aap.activity_project?.code}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
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
                            {new Date(aap.created_at).toLocaleDateString()}
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
                    <div className="flex gap-2 ml-4">
                      <Link href={`/dashboard/aap/${aap.aap_id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {aap.status === 'Draft' && (
                        <Link href={`/dashboard/aap/${aap.aap_id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      {aaps.length === 0 && (
        <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">Getting Started with AAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-emerald-800">
              <p>
                <strong>Annual Activity Plans (AAPs)</strong> are bottom-up planning documents
                that capture your department's proposed activities and budget requirements.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">To create an AAP:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Create New AAP" above</li>
                  <li>Select your Division, Program, and Activity</li>
                  <li>Add activity line items with proposed costs</li>
                  <li>Schedule activities by month (Jan-Dec)</li>
                  <li>Submit for approval by Planning Office</li>
                </ol>
              </div>
              <p className="text-xs text-emerald-700 mt-4">
                Once approved, your AAP will be linked to the government budget allocation
                and all GE requests will be validated against it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
