'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Building2,
  DollarSign,
  FileText,
  Trash2,
  Edit,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  getActiveFiscalYear,
  getBudgetVersions,
  createBudgetVersion,
  activateBudgetVersion,
  getBudgetLinesByVersion,
  createBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  getAAPsByYear,
  getAAPLinesByAAP,
} from '@/lib/aap';
import type {
  FiscalYear,
  BudgetVersion,
  BudgetLine,
  AAPHeader,
  FundSource,
  BudgetStatus,
} from '@/lib/aap-types';

export default function BudgetAllocationPage() {
  const [loading, setLoading] = useState(true);
  const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);
  const [budgetVersions, setBudgetVersions] = useState<BudgetVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<BudgetVersion | null>(null);
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [approvedAAPs, setApprovedAAPs] = useState<AAPHeader[]>([]);
  const [aapLines, setAAPLines] = useState<any[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);
  const [showNewVersionDialog, setShowNewVersionDialog] = useState(false);
  const [showNewLineDialog, setShowNewLineDialog] = useState(false);
  const [editingLine, setEditingLine] = useState<BudgetLine | null>(null);
  const [budgetUtilization, setBudgetUtilization] = useState<Map<number, {
    committed: number;
    actual: number;
    available: number;
  }>>(new Map());

  // New version form
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');

  // New budget line form
  const [selectedAAP, setSelectedAAP] = useState<number | null>(null);
  const [selectedAAPLine, setSelectedAAPLine] = useState<number | null>(null);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [fundSource, setFundSource] = useState<FundSource>('GoPNG');
  const [budgetRemarks, setBudgetRemarks] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadBudgetLines();
    }
  }, [selectedVersion]);

  async function loadInitialData() {
    try {
      setLoading(true);

      const year = await getActiveFiscalYear();
      if (!year) {
        toast.error('No active fiscal year found');
        return;
      }
      setFiscalYear(year);

      // Load budget versions
      const versions = await getBudgetVersions(year.year_id);
      setBudgetVersions(versions);

      // Set active version as selected
      const activeVersion = versions.find(v => v.is_active);
      if (activeVersion) {
        setSelectedVersion(activeVersion);
      } else if (versions.length > 0) {
        setSelectedVersion(versions[0]);
      }

      // Load approved AAPs
      const aaps = await getAAPsByYear(year.year_id);
      const approved = aaps.filter(aap => aap.status === 'Approved');
      setApprovedAAPs(approved);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load budget allocation data');
    } finally {
      setLoading(false);
    }
  }

  async function loadBudgetLines() {
    if (!selectedVersion) return;

    try {
      const lines = await getBudgetLinesByVersion(selectedVersion.budget_version_id);
      setBudgetLines(lines);

      // Load utilization for each budget line
      await loadBudgetUtilization(lines);
    } catch (error) {
      console.error('Error loading budget lines:', error);
      toast.error('Failed to load budget lines');
    }
  }

  async function loadBudgetUtilization(lines: BudgetLine[]) {
    // In a real implementation, this would fetch actual committed and spent amounts
    // For now, we'll simulate it
    const utilization = new Map();

    for (const line of lines) {
      // Simulate some utilization (in production, fetch from database)
      const committed = line.approved_amount * (Math.random() * 0.3); // 0-30% committed
      const actual = line.approved_amount * (Math.random() * 0.2); // 0-20% actual
      const available = line.approved_amount - committed - actual;

      utilization.set(line.budget_line_id, {
        committed,
        actual,
        available,
      });
    }

    setBudgetUtilization(utilization);
  }

  async function handleCreateVersion() {
    if (!fiscalYear || !newVersionName.trim()) {
      toast.error('Version name is required');
      return;
    }

    try {
      const version = await createBudgetVersion(
        fiscalYear.year_id,
        newVersionName,
        newVersionDescription || undefined,
        'current-user-id' // TODO: Get from auth
      );

      toast.success('Budget version created successfully');
      setShowNewVersionDialog(false);
      setNewVersionName('');
      setNewVersionDescription('');

      // Reload versions
      await loadInitialData();
      setSelectedVersion(version);
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to create budget version');
    }
  }

  async function handleActivateVersion(versionId: number) {
    try {
      await activateBudgetVersion(versionId);
      toast.success('Budget version activated');
      await loadInitialData();
    } catch (error) {
      console.error('Error activating version:', error);
      toast.error('Failed to activate version');
    }
  }

  async function handleAAPSelection(aapId: number) {
    setSelectedAAP(aapId);
    setSelectedAAPLine(null);
    setAAPLines([]);

    if (!aapId) return;

    try {
      setLoadingLines(true);
      const lines = await getAAPLinesByAAP(aapId);
      setAAPLines(lines);
    } catch (error) {
      console.error('Error loading AAP lines:', error);
      toast.error('Failed to load AAP line items');
    } finally {
      setLoadingLines(false);
    }
  }

  async function handleCreateBudgetLine() {
    if (!selectedVersion || !selectedAAPLine || budgetAmount <= 0) {
      toast.error('Please select AAP line and enter valid amount');
      return;
    }

    try {
      if (editingLine) {
        // Update existing line
        await updateBudgetLine(editingLine.budget_line_id, {
          budget_version_id: selectedVersion.budget_version_id,
          aap_line_id: selectedAAPLine,
          account_id: 1,
          approved_amount: budgetAmount,
          fund_source: fundSource,
          status: 'Active',
          remarks: budgetRemarks || undefined,
        });
        toast.success('Budget line updated successfully');
      } else {
        // Create new line
        await createBudgetLine({
          budget_version_id: selectedVersion.budget_version_id,
          aap_line_id: selectedAAPLine,
          account_id: 1,
          approved_amount: budgetAmount,
          fund_source: fundSource,
          status: 'Active',
          remarks: budgetRemarks || undefined,
        });
        toast.success('Budget line created successfully');
      }

      setShowNewLineDialog(false);
      resetLineForm();
      await loadBudgetLines();
    } catch (error) {
      console.error('Error saving budget line:', error);
      toast.error('Failed to save budget line');
    }
  }

  async function handleEditBudgetLine(line: BudgetLine) {
    setEditingLine(line);
    setSelectedAAP(line.aap_line?.aap_id || null);
    setSelectedAAPLine(line.aap_line_id);
    setBudgetAmount(line.approved_amount);
    setFundSource(line.fund_source);
    setBudgetRemarks(line.remarks || '');

    // Load AAP lines if we have an AAP
    if (line.aap_line?.aap_id) {
      await handleAAPSelection(line.aap_line.aap_id);
    }

    setShowNewLineDialog(true);
  }

  async function handleDeleteBudgetLine(lineId: number) {
    if (!confirm('Are you sure you want to delete this budget line?')) {
      return;
    }

    try {
      await deleteBudgetLine(lineId);
      toast.success('Budget line deleted successfully');
      await loadBudgetLines();
    } catch (error) {
      console.error('Error deleting budget line:', error);
      toast.error('Failed to delete budget line');
    }
  }

  function resetLineForm() {
    setSelectedAAP(null);
    setSelectedAAPLine(null);
    setBudgetAmount(0);
    setFundSource('GoPNG');
    setBudgetRemarks('');
    setEditingLine(null);
  }

  const totalAllocated = budgetLines.reduce((sum, line) => sum + (line.approved_amount || 0), 0);
  const totalProposed = approvedAAPs.reduce((sum, aap) => sum + (aap.total_proposed_cost || 0), 0);
  const allocationRate = totalProposed > 0 ? (totalAllocated / totalProposed) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budget allocation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Allocation</h1>
          <p className="text-gray-600 mt-1">
            Map government PGAS appropriations to approved AAP activities
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowNewVersionDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Version
          </Button>
          <Link href="/dashboard/pgas">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import PGAS
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fiscal Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{fiscalYear?.year_id}</div>
            <p className="text-xs text-gray-500 mt-1">
              {budgetVersions.length} version{budgetVersions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Proposed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              K{(totalProposed / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {approvedAAPs.length} approved AAPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Budget Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              K{(totalAllocated / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budgetLines.length} budget lines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Allocation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {allocationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {allocationRate >= 100 ? 'Fully funded' : 'Partially funded'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Versions */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Versions</CardTitle>
          <CardDescription>
            Manage different budget versions (Original, Revised, Supplementary)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetVersions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No budget versions yet</p>
              <Button onClick={() => setShowNewVersionDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Version
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetVersions.map((version) => (
                <div
                  key={version.budget_version_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedVersion?.budget_version_id === version.budget_version_id
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{version.name}</h3>
                        {version.is_active && (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(version.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!version.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateVersion(version.budget_version_id);
                          }}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVersion(version);
                        }}
                      >
                        View Lines
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Lines */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Lines - {selectedVersion.name}</CardTitle>
                <CardDescription>
                  Map budget allocations to approved AAP line items
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowNewLineDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Budget Line
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {budgetLines.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No budget lines allocated yet</p>
                <Button onClick={() => setShowNewLineDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Budget Line
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {budgetLines.map((line) => (
                  <div
                    key={line.budget_line_id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-emerald-200 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {line.aap_line?.item_no}
                          </Badge>
                          <Badge variant="outline">{line.fund_source}</Badge>
                          <Badge
                            className={
                              line.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {line.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {line.aap_line?.activity_description}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {line.aap_line?.specific_output}
                        </p>
                        {line.remarks && (
                          <p className="text-xs text-gray-500 mt-2">
                            Note: {line.remarks}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-right mb-3">
                          <p className="text-sm text-gray-600">Allocated</p>
                          <p className="text-xl font-bold text-emerald-600">
                            K{line.approved_amount.toLocaleString()}
                          </p>
                        </div>

                        {/* Budget Utilization */}
                        {budgetUtilization.has(line.budget_line_id) && (
                          <div className="space-y-2 mb-3 min-w-[200px]">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Committed:</span>
                              <span className="font-medium text-orange-600">
                                K{budgetUtilization.get(line.budget_line_id)!.committed.toFixed(0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Actual:</span>
                              <span className="font-medium text-red-600">
                                K{budgetUtilization.get(line.budget_line_id)!.actual.toFixed(0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-gray-700">Available:</span>
                              <span className="text-green-600">
                                K{budgetUtilization.get(line.budget_line_id)!.available.toFixed(0)}
                              </span>
                            </div>

                            {/* Utilization Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 via-red-500 to-green-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${((budgetUtilization.get(line.budget_line_id)!.committed +
                                            budgetUtilization.get(line.budget_line_id)!.actual) /
                                            line.approved_amount) * 100}%`
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                              {(((budgetUtilization.get(line.budget_line_id)!.committed +
                                  budgetUtilization.get(line.budget_line_id)!.actual) /
                                  line.approved_amount) * 100).toFixed(1)}% utilized
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditBudgetLine(line)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteBudgetLine(line.budget_line_id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Version Dialog */}
      {showNewVersionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Budget Version</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewVersionDialog(false);
                    setNewVersionName('');
                    setNewVersionDescription('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Version Name *</Label>
                <Input
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="e.g., Original Budget 2025, Revised Q2, Supplementary"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newVersionDescription}
                  onChange={(e) => setNewVersionDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewVersionDialog(false);
                    setNewVersionName('');
                    setNewVersionDescription('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateVersion}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Create Version
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Budget Line Dialog */}
      {showNewLineDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingLine ? 'Edit Budget Line' : 'Add Budget Line'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewLineDialog(false);
                    resetLineForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                {editingLine ? 'Update budget allocation details' : 'Link budget allocation to an approved AAP line item'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Approved AAP *</Label>
                <select
                  value={selectedAAP || ''}
                  onChange={(e) => handleAAPSelection(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                >
                  <option value="">Choose an approved AAP...</option>
                  {approvedAAPs.map((aap) => (
                    <option key={aap.aap_id} value={aap.aap_id}>
                      {aap.activity_project?.code} - {aap.activity_project?.name} (K
                      {aap.total_proposed_cost?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAAP && (
                <div>
                  <Label>Select AAP Line Item *</Label>
                  <select
                    value={selectedAAPLine || ''}
                    onChange={(e) => setSelectedAAPLine(Number(e.target.value))}
                    disabled={loadingLines}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingLines ? 'Loading line items...' : 'Choose a line item...'}
                    </option>
                    {aapLines.map((line) => (
                      <option key={line.aap_line_id} value={line.aap_line_id}>
                        {line.item_no} - {line.activity_description} (Proposed: K
                        {line.proposed_cost?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {aapLines.length} line item{aapLines.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Budget Amount (PGK) *</Label>
                  <Input
                    type="number"
                    value={budgetAmount || ''}
                    onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label>Fund Source *</Label>
                  <select
                    value={fundSource}
                    onChange={(e) => setFundSource(e.target.value as FundSource)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="GoPNG">Government of PNG</option>
                    <option value="Internal Revenue">Internal Revenue</option>
                    <option value="Donor">Donor Funding</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Remarks (Optional)</Label>
                <Input
                  value={budgetRemarks}
                  onChange={(e) => setBudgetRemarks(e.target.value)}
                  placeholder="Any notes or conditions..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewLineDialog(false);
                    resetLineForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBudgetLine}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!selectedAAPLine || budgetAmount <= 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingLine ? 'Update Budget Line' : 'Add Budget Line'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">How Budget Allocation Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Budget allocation links government funding to approved activities:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Create a budget version (e.g., Original Budget 2025)</li>
              <li>Import PGAS appropriations or manually enter allocations</li>
              <li>Map each budget line to an approved AAP activity</li>
              <li>Track allocation rate (budget allocated vs. proposed)</li>
              <li>Activate the version to enable spending against it</li>
            </ol>
            <p className="text-xs text-blue-700 mt-4">
              <strong>Note:</strong> Only approved AAP activities can receive budget
              allocations. GE requests will check against allocated budgets in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
