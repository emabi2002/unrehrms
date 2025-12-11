'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Building2,
  User,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getActiveFiscalYear,
  getDivisions,
  getDepartmentsByDivision,
  getProgramsByDivision,
  getActivitiesByProgram,
  getChartOfAccounts,
  createAAP,
  addAAPLine,
  setMonthlySchedule,
  submitAAP,
} from '@/lib/aap';
import type {
  FiscalYear,
  Division,
  Department,
  Program,
  ActivityProject,
  ChartOfAccounts,
  AAPHeader,
} from '@/lib/aap-types';
import { MONTHS } from '@/lib/aap-types';

interface AAPLineInput {
  item_no: string;
  activity_description: string;
  specific_output: string;
  target_output: string;
  proposed_cost: number;
  economic_item_code: string;
  account_id?: number;
  manpower_months?: number;
}

interface MonthlySchedule {
  [lineIndex: number]: {
    [month: number]: {
      is_scheduled: boolean;
      planned_quantity?: number;
      planned_cost?: number;
      notes?: string;
    };
  };
}

export default function NewAAPPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step 1: Header Data
  const [fiscalYear, setFiscalYear] = useState<FiscalYear | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activities, setActivities] = useState<ActivityProject[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccounts[]>([]);

  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);

  const [headOfActivity, setHeadOfActivity] = useState('');
  const [manager, setManager] = useState('');
  const [telephone, setTelephone] = useState('');
  const [fax, setFax] = useState('');

  // Step 2: AAP Lines
  const [aapLines, setAapLines] = useState<AAPLineInput[]>([]);

  // Step 3: Monthly Schedules
  const [monthlySchedules, setMonthlySchedules] = useState<MonthlySchedule>({});

  // Created AAP (after save)
  const [createdAAP, setCreatedAAP] = useState<AAPHeader | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDivisionId) {
      loadDivisionData();
    }
  }, [selectedDivisionId]);

  useEffect(() => {
    if (selectedProgramId) {
      loadProgramActivities();
    }
  }, [selectedProgramId]);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [year, divs, accounts] = await Promise.all([
        getActiveFiscalYear(),
        getDivisions(),
        getChartOfAccounts(),
      ]);
      setFiscalYear(year);
      setDivisions(divs);
      setChartOfAccounts(accounts);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load initial data. Please deploy the database schema first.');
    } finally {
      setLoading(false);
    }
  }

  async function loadDivisionData() {
    if (!selectedDivisionId) return;

    try {
      const [depts, progs] = await Promise.all([
        getDepartmentsByDivision(selectedDivisionId),
        getProgramsByDivision(selectedDivisionId),
      ]);
      setDepartments(depts);
      setPrograms(progs);
    } catch (error) {
      console.error('Error loading division data:', error);
      toast.error('Failed to load division data');
    }
  }

  async function loadProgramActivities() {
    if (!selectedProgramId) return;

    try {
      const acts = await getActivitiesByProgram(selectedProgramId);
      setActivities(acts);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activities');
    }
  }

  function addNewLine() {
    setAapLines([
      ...aapLines,
      {
        item_no: '',
        activity_description: '',
        specific_output: '',
        target_output: '',
        proposed_cost: 0,
        economic_item_code: '',
        manpower_months: 0,
      },
    ]);
  }

  function removeLine(index: number) {
    const newLines = aapLines.filter((_, i) => i !== index);
    setAapLines(newLines);

    // Remove schedules for this line
    const newSchedules = { ...monthlySchedules };
    delete newSchedules[index];
    setMonthlySchedules(newSchedules);
  }

  function updateLine(index: number, field: keyof AAPLineInput, value: any) {
    const newLines = [...aapLines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };
    setAapLines(newLines);
  }

  function toggleMonthSchedule(lineIndex: number, month: number) {
    setMonthlySchedules((prev) => {
      const lineSchedule = prev[lineIndex] || {};
      const monthSchedule = lineSchedule[month] || { is_scheduled: false };

      return {
        ...prev,
        [lineIndex]: {
          ...lineSchedule,
          [month]: {
            ...monthSchedule,
            is_scheduled: !monthSchedule.is_scheduled,
          },
        },
      };
    });
  }

  function updateMonthSchedule(
    lineIndex: number,
    month: number,
    field: 'planned_quantity' | 'planned_cost' | 'notes',
    value: any
  ) {
    setMonthlySchedules((prev) => {
      const lineSchedule = prev[lineIndex] || {};
      const monthSchedule = lineSchedule[month] || { is_scheduled: true };

      return {
        ...prev,
        [lineIndex]: {
          ...lineSchedule,
          [month]: {
            ...monthSchedule,
            [field]: value,
          },
        },
      };
    });
  }

  async function saveAsDraft() {
    if (!validateStep1()) return;

    try {
      setSaving(true);

      // Create AAP header
      const aap = await createAAP(
        {
          year_id: fiscalYear!.year_id,
          division_id: selectedDivisionId!,
          department_id: selectedDepartmentId || undefined,
          program_id: selectedProgramId!,
          activity_id: selectedActivityId!,
          head_of_activity: headOfActivity || undefined,
          manager: manager || undefined,
          telephone: telephone || undefined,
          fax: fax || undefined,
        },
        'current-user-id' // TODO: Get from auth context
      );

      setCreatedAAP(aap);

      // Add lines if any
      if (aapLines.length > 0) {
        for (const line of aapLines) {
          const createdLine = await addAAPLine({
            aap_id: aap.aap_id,
            ...line,
          });

          // Add monthly schedules for this line
          const lineIndex = aapLines.indexOf(line);
          const lineSchedules = monthlySchedules[lineIndex] || {};

          for (const [monthStr, schedule] of Object.entries(lineSchedules)) {
            const month = parseInt(monthStr);
            if (schedule.is_scheduled) {
              await setMonthlySchedule({
                aap_line_id: createdLine.aap_line_id,
                month,
                is_scheduled: schedule.is_scheduled,
                planned_quantity: schedule.planned_quantity,
                planned_cost: schedule.planned_cost,
                notes: schedule.notes,
              });
            }
          }
        }
      }

      toast.success('AAP saved as draft successfully');
      router.push(`/dashboard/aap/${aap.aap_id}`);
    } catch (error) {
      console.error('Error saving AAP:', error);
      toast.error('Failed to save AAP. Please check your database connection.');
    } finally {
      setSaving(false);
    }
  }

  async function saveAndSubmit() {
    await saveAsDraft();

    if (createdAAP) {
      try {
        await submitAAP(createdAAP.aap_id);
        toast.success('AAP submitted for approval successfully');
        router.push(`/dashboard/aap/${createdAAP.aap_id}`);
      } catch (error) {
        console.error('Error submitting AAP:', error);
        toast.error('AAP saved but failed to submit');
      }
    }
  }

  function validateStep1(): boolean {
    if (!fiscalYear) {
      toast.error('No active fiscal year found');
      return false;
    }
    if (!selectedDivisionId) {
      toast.error('Please select a division');
      return false;
    }
    if (!selectedProgramId) {
      toast.error('Please select a program');
      return false;
    }
    if (!selectedActivityId) {
      toast.error('Please select an activity');
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (aapLines.length === 0) {
      toast.error('Please add at least one activity line item');
      return false;
    }

    for (let i = 0; i < aapLines.length; i++) {
      const line = aapLines[i];
      if (!line.item_no) {
        toast.error(`Line ${i + 1}: Item number is required`);
        return false;
      }
      if (!line.activity_description) {
        toast.error(`Line ${i + 1}: Activity description is required`);
        return false;
      }
      if (line.proposed_cost <= 0) {
        toast.error(`Line ${i + 1}: Proposed cost must be greater than 0`);
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    setCurrentStep(currentStep + 1);
  }

  function previousStep() {
    setCurrentStep(currentStep - 1);
  }

  const totalProposedCost = aapLines.reduce((sum, line) => sum + (line.proposed_cost || 0), 0);

  const selectedDivision = divisions.find(d => d.division_id === selectedDivisionId);
  const selectedProgram = programs.find(p => p.program_id === selectedProgramId);
  const selectedActivity = activities.find(a => a.activity_id === selectedActivityId);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AAP form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/aap')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AAPs
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Annual Activity Plan</h1>
            <p className="text-gray-600 mt-1">
              Fiscal Year {fiscalYear?.year_id || '2025'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Header Information', icon: Building2 },
              { num: 2, label: 'Activity Line Items', icon: FileText },
              { num: 3, label: 'Monthly Schedule', icon: Calendar },
              { num: 4, label: 'Review & Submit', icon: CheckCircle },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.num
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      currentStep >= step.num ? 'text-emerald-700 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.num ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Header Information</CardTitle>
            <CardDescription>
              Select your organizational unit and activity, then provide contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organizational Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Division */}
              <div>
                <Label htmlFor="division">Division *</Label>
                <select
                  id="division"
                  value={selectedDivisionId || ''}
                  onChange={(e) => {
                    setSelectedDivisionId(e.target.value ? Number(e.target.value) : null);
                    setSelectedDepartmentId(null);
                    setSelectedProgramId(null);
                    setSelectedActivityId(null);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div.division_id} value={div.division_id}>
                      {div.code} - {div.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department (Optional) */}
              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <select
                  id="department"
                  value={selectedDepartmentId || ''}
                  onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!selectedDivisionId}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 disabled:bg-gray-100"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program */}
              <div>
                <Label htmlFor="program">Program *</Label>
                <select
                  id="program"
                  value={selectedProgramId || ''}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value ? Number(e.target.value) : null);
                    setSelectedActivityId(null);
                  }}
                  disabled={!selectedDivisionId}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 disabled:bg-gray-100"
                >
                  <option value="">Select Program</option>
                  {programs.map((prog) => (
                    <option key={prog.program_id} value={prog.program_id}>
                      {prog.program_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Activity */}
              <div>
                <Label htmlFor="activity">Activity / Project *</Label>
                <select
                  id="activity"
                  value={selectedActivityId || ''}
                  onChange={(e) => setSelectedActivityId(e.target.value ? Number(e.target.value) : null)}
                  disabled={!selectedProgramId}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 disabled:bg-gray-100"
                >
                  <option value="">Select Activity</option>
                  {activities.map((act) => (
                    <option key={act.activity_id} value={act.activity_id}>
                      {act.code} - {act.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headOfActivity">Head of Activity</Label>
                  <Input
                    id="headOfActivity"
                    value={headOfActivity}
                    onChange={(e) => setHeadOfActivity(e.target.value)}
                    placeholder="Name of activity head"
                  />
                </div>

                <div>
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    placeholder="Manager name"
                  />
                </div>

                <div>
                  <Label htmlFor="telephone">Telephone</Label>
                  <Input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    value={fax}
                    onChange={(e) => setFax(e.target.value)}
                    placeholder="Fax number"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 2: Activity Line Items</CardTitle>
                <CardDescription>
                  Add planned activities with proposed costs and outputs
                </CardDescription>
              </div>
              <Button onClick={addNewLine} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aapLines.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No activity line items yet</p>
                <Button onClick={addNewLine} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Line Item
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {aapLines.map((line, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-800">Line {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Item No. *</Label>
                        <Input
                          value={line.item_no}
                          onChange={(e) => updateLine(index, 'item_no', e.target.value)}
                          placeholder="e.g. 221, 223"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Activity Description *</Label>
                        <Input
                          value={line.activity_description}
                          onChange={(e) => updateLine(index, 'activity_description', e.target.value)}
                          placeholder="e.g. Travel & Subsistence"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Specific Output</Label>
                        <Input
                          value={line.specific_output}
                          onChange={(e) => updateLine(index, 'specific_output', e.target.value)}
                          placeholder="e.g. Staff Travel"
                        />
                      </div>

                      <div>
                        <Label>Target Output</Label>
                        <Input
                          value={line.target_output}
                          onChange={(e) => updateLine(index, 'target_output', e.target.value)}
                          placeholder="e.g. 4 x Travel"
                        />
                      </div>

                      <div>
                        <Label>Proposed Cost (PGK) *</Label>
                        <Input
                          type="number"
                          value={line.proposed_cost || ''}
                          onChange={(e) => updateLine(index, 'proposed_cost', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <Label>Economic Item Code</Label>
                        <select
                          value={line.economic_item_code}
                          onChange={(e) => updateLine(index, 'economic_item_code', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="">Select Code</option>
                          {Array.from(new Set(chartOfAccounts.map(a => a.economic_item_code).filter(Boolean))).map((code) => {
                            const account = chartOfAccounts.find(a => a.economic_item_code === code);
                            return (
                              <option key={code} value={code}>
                                {code} - {account?.economic_item_name}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <Label>Manpower (Months)</Label>
                        <Input
                          type="number"
                          value={line.manpower_months || ''}
                          onChange={(e) => updateLine(index, 'manpower_months', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="border-t pt-4 flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Proposed Cost</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      K{totalProposedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Monthly Implementation Schedule</CardTitle>
            <CardDescription>
              Schedule when each activity will be implemented (January - December)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aapLines.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-gray-600">Please add activity line items first</p>
              </div>
            ) : (
              <div className="space-y-6">
                {aapLines.map((line, lineIndex) => (
                  <div key={lineIndex} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">
                      {line.item_no} - {line.activity_description}
                    </h4>
                    <div className="grid grid-cols-12 gap-2">
                      {MONTHS.map((month) => {
                        const isScheduled = monthlySchedules[lineIndex]?.[month.value]?.is_scheduled || false;
                        return (
                          <button
                            key={month.value}
                            onClick={() => toggleMonthSchedule(lineIndex, month.value)}
                            className={`p-2 rounded text-xs font-medium transition-colors ${
                              isScheduled
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={month.label}
                          >
                            {month.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Review & Submit</CardTitle>
            <CardDescription>
              Review your AAP before saving or submitting for approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Header Information</h3>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Division</p>
                  <p className="font-medium">{selectedDivision?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Program</p>
                  <p className="font-medium">{selectedProgram?.program_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activity</p>
                  <p className="font-medium">{selectedActivity?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium">{manager || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Lines Summary */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Activity Line Items ({aapLines.length})</h3>
              <div className="space-y-2">
                {aapLines.map((line, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium">{line.item_no} - {line.activity_description}</p>
                      <p className="text-sm text-gray-600">{line.specific_output}</p>
                    </div>
                    <p className="font-semibold text-emerald-600">
                      K{line.proposed_cost.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total Proposed Budget</p>
                <p className="text-2xl font-bold text-emerald-600">
                  K{totalProposedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep === 4 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={saveAsDraft}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button
                    onClick={saveAndSubmit}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {saving ? 'Submitting...' : 'Save & Submit'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
