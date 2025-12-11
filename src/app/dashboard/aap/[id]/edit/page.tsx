'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAAPById,
  getAAPLinesByAAP,
  getMonthlySchedule,
  getDivisions,
  getDepartmentsByDivision,
  getProgramsByDivision,
  getActivitiesByProgram,
  getChartOfAccounts,
  updateAAPHeader,
  updateAAPLine,
  addAAPLine,
  deleteAAPLine,
  setMonthlySchedule,
  submitAAP,
} from '@/lib/aap';
import type {
  AAPHeader,
  AAPLine,
  AAPLineSchedule,
  Division,
  Department,
  Program,
  ActivityProject,
  ChartOfAccounts,
} from '@/lib/aap-types';
import { MONTHS } from '@/lib/aap-types';

interface EditableAAPLine extends AAPLine {
  isNew?: boolean;
  isDeleted?: boolean;
}

export default function EditAAPPage() {
  const router = useRouter();
  const params = useParams();
  const aapId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Original data
  const [originalAAP, setOriginalAAP] = useState<AAPHeader | null>(null);
  const [aap, setAAP] = useState<AAPHeader | null>(null);
  const [lines, setLines] = useState<EditableAAPLine[]>([]);
  const [schedules, setSchedules] = useState<{ [lineId: number]: { [month: number]: AAPLineSchedule } }>({});

  // Master data
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activities, setActivities] = useState<ActivityProject[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccounts[]>([]);

  useEffect(() => {
    loadData();
  }, [aapId]);

  useEffect(() => {
    if (aap?.division_id) {
      loadDivisionData();
    }
  }, [aap?.division_id]);

  useEffect(() => {
    if (aap?.program_id) {
      loadProgramActivities();
    }
  }, [aap?.program_id]);

  async function loadData() {
    try {
      setLoading(true);

      // Load AAP
      const aapData = await getAAPById(aapId);
      if (!aapData) {
        toast.error('AAP not found');
        router.push('/dashboard/aap');
        return;
      }

      // Check if AAP is in Draft status
      if (aapData.status !== 'Draft') {
        toast.error('Only draft AAPs can be edited');
        router.push(`/dashboard/aap/${aapId}`);
        return;
      }

      setOriginalAAP(aapData);
      setAAP(aapData);

      // Load lines
      const linesData = await getAAPLinesByAAP(aapId);
      setLines(linesData);

      // Load schedules
      const schedulesData: { [lineId: number]: { [month: number]: AAPLineSchedule } } = {};
      for (const line of linesData) {
        const lineSchedules = await getMonthlySchedule(line.aap_line_id);
        schedulesData[line.aap_line_id] = {};
        lineSchedules.forEach(schedule => {
          schedulesData[line.aap_line_id][schedule.month] = schedule;
        });
      }
      setSchedules(schedulesData);

      // Load master data
      const [divs, accounts] = await Promise.all([
        getDivisions(),
        getChartOfAccounts(),
      ]);
      setDivisions(divs);
      setChartOfAccounts(accounts);
    } catch (error) {
      console.error('Error loading AAP:', error);
      toast.error('Failed to load AAP data');
    } finally {
      setLoading(false);
    }
  }

  async function loadDivisionData() {
    if (!aap?.division_id) return;

    try {
      const [depts, progs] = await Promise.all([
        getDepartmentsByDivision(aap.division_id),
        getProgramsByDivision(aap.division_id),
      ]);
      setDepartments(depts);
      setPrograms(progs);
    } catch (error) {
      console.error('Error loading division data:', error);
    }
  }

  async function loadProgramActivities() {
    if (!aap?.program_id) return;

    try {
      const acts = await getActivitiesByProgram(aap.program_id);
      setActivities(acts);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  function updateHeader(field: keyof AAPHeader, value: any) {
    if (!aap) return;
    setAAP({ ...aap, [field]: value });
  }

  function addNewLine() {
    const newLine: EditableAAPLine = {
      aap_line_id: -(Date.now()), // Temporary negative ID
      aap_id: aapId,
      item_no: '',
      activity_description: '',
      specific_output: '',
      target_output: '',
      proposed_cost: 0,
      economic_item_code: '',
      manpower_months: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true,
    };
    setLines([...lines, newLine]);
  }

  function updateLine(index: number, field: keyof EditableAAPLine, value: any) {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };
    setLines(newLines);
  }

  function removeLine(index: number) {
    const line = lines[index];
    if (line.isNew) {
      // If it's a new line that hasn't been saved, just remove it
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
    } else {
      // If it's an existing line, mark it for deletion
      const newLines = [...lines];
      newLines[index] = { ...newLines[index], isDeleted: true };
      setLines(newLines);
    }
  }

  function toggleMonthSchedule(lineId: number, month: number) {
    setSchedules(prev => {
      const lineSchedule = prev[lineId] || {};
      const monthSchedule = lineSchedule[month];

      return {
        ...prev,
        [lineId]: {
          ...lineSchedule,
          [month]: monthSchedule
            ? { ...monthSchedule, is_scheduled: !monthSchedule.is_scheduled }
            : {
                aap_line_schedule_id: 0,
                aap_line_id: lineId,
                month,
                is_scheduled: true,
                created_at: new Date().toISOString(),
              }
        }
      };
    });
  }

  async function saveChanges(andSubmit: boolean = false) {
    if (!aap) return;

    try {
      setSaving(true);

      // 1. Update header if changed
      if (JSON.stringify(aap) !== JSON.stringify(originalAAP)) {
        await updateAAPHeader(aapId, {
          division_id: aap.division_id,
          department_id: aap.department_id || undefined,
          program_id: aap.program_id,
          activity_id: aap.activity_id,
          head_of_activity: aap.head_of_activity || undefined,
          manager: aap.manager || undefined,
          telephone: aap.telephone || undefined,
          fax: aap.fax || undefined,
        });
      }

      // 2. Process line changes
      for (const line of lines) {
        // Delete marked lines
        if (line.isDeleted && !line.isNew) {
          await deleteAAPLine(line.aap_line_id);
          continue;
        }

        // Skip deleted lines
        if (line.isDeleted) continue;

        // Add new lines
        if (line.isNew) {
          const createdLine = await addAAPLine({
            aap_id: aapId,
            item_no: line.item_no,
            activity_description: line.activity_description,
            specific_output: line.specific_output || undefined,
            target_output: line.target_output || undefined,
            proposed_cost: line.proposed_cost,
            economic_item_code: line.economic_item_code || undefined,
            account_id: line.account_id || undefined,
            manpower_months: line.manpower_months || undefined,
          });

          // Update schedules with new line ID
          const lineSchedules = schedules[line.aap_line_id] || {};
          for (const [monthStr, schedule] of Object.entries(lineSchedules)) {
            if (schedule.is_scheduled) {
              await setMonthlySchedule({
                aap_line_id: createdLine.aap_line_id,
                month: parseInt(monthStr),
                is_scheduled: schedule.is_scheduled,
                planned_quantity: schedule.planned_quantity,
                planned_cost: schedule.planned_cost,
                notes: schedule.notes,
              });
            }
          }
        } else {
          // Update existing lines
          await updateAAPLine(line.aap_line_id, {
            aap_id: aapId,
            item_no: line.item_no,
            activity_description: line.activity_description,
            specific_output: line.specific_output || undefined,
            target_output: line.target_output || undefined,
            proposed_cost: line.proposed_cost,
            economic_item_code: line.economic_item_code || undefined,
            account_id: line.account_id || undefined,
            manpower_months: line.manpower_months || undefined,
          });

          // Update schedules
          const lineSchedules = schedules[line.aap_line_id] || {};
          for (const [monthStr, schedule] of Object.entries(lineSchedules)) {
            await setMonthlySchedule({
              aap_line_id: line.aap_line_id,
              month: parseInt(monthStr),
              is_scheduled: schedule.is_scheduled,
              planned_quantity: schedule.planned_quantity,
              planned_cost: schedule.planned_cost,
              notes: schedule.notes,
            });
          }
        }
      }

      // 3. Submit if requested
      if (andSubmit) {
        await submitAAP(aapId);
        toast.success('AAP updated and submitted successfully');
      } else {
        toast.success('AAP updated successfully');
      }

      router.push(`/dashboard/aap/${aapId}`);
    } catch (error) {
      console.error('Error saving AAP:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function validateStep1(): boolean {
    if (!aap?.division_id) {
      toast.error('Please select a division');
      return false;
    }
    if (!aap?.program_id) {
      toast.error('Please select a program');
      return false;
    }
    if (!aap?.activity_id) {
      toast.error('Please select an activity');
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    const activeLines = lines.filter(l => !l.isDeleted);
    if (activeLines.length === 0) {
      toast.error('Please add at least one activity line item');
      return false;
    }

    for (let i = 0; i < activeLines.length; i++) {
      const line = activeLines[i];
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

  const totalProposedCost = lines
    .filter(l => !l.isDeleted)
    .reduce((sum, line) => sum + (line.proposed_cost || 0), 0);

  const activeLines = lines.filter(l => !l.isDeleted);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading AAP...</p>
        </div>
      </div>
    );
  }

  if (!aap) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Edit AAP</h3>
              <p className="text-gray-600 mb-4">This AAP cannot be edited.</p>
              <Button onClick={() => router.push('/dashboard/aap')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to AAPs
              </Button>
            </div>
          </CardContent>
        </Card>
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
            onClick={() => router.push(`/dashboard/aap/${aapId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Edit Annual Activity Plan</h1>
              <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Fiscal Year {aap.fiscal_year?.year_id || '2025'}
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
              { num: 4, label: 'Review & Save', icon: CheckCircle },
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

      {/* Step 1: Header */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Header Information</CardTitle>
            <CardDescription>Update organizational unit and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Division *</Label>
                <select
                  value={aap.division_id || ''}
                  onChange={(e) => {
                    updateHeader('division_id', Number(e.target.value));
                    updateHeader('department_id', null);
                    updateHeader('program_id', null);
                    updateHeader('activity_id', null);
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

              <div>
                <Label>Department (Optional)</Label>
                <select
                  value={aap.department_id || ''}
                  onChange={(e) => updateHeader('department_id', e.target.value ? Number(e.target.value) : null)}
                  disabled={!aap.division_id}
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

              <div>
                <Label>Program *</Label>
                <select
                  value={aap.program_id || ''}
                  onChange={(e) => {
                    updateHeader('program_id', Number(e.target.value));
                    updateHeader('activity_id', null);
                  }}
                  disabled={!aap.division_id}
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

              <div>
                <Label>Activity / Project *</Label>
                <select
                  value={aap.activity_id || ''}
                  onChange={(e) => updateHeader('activity_id', Number(e.target.value))}
                  disabled={!aap.program_id}
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

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Head of Activity</Label>
                  <Input
                    value={aap.head_of_activity || ''}
                    onChange={(e) => updateHeader('head_of_activity', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Manager</Label>
                  <Input
                    value={aap.manager || ''}
                    onChange={(e) => updateHeader('manager', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Telephone</Label>
                  <Input
                    value={aap.telephone || ''}
                    onChange={(e) => updateHeader('telephone', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fax</Label>
                  <Input
                    value={aap.fax || ''}
                    onChange={(e) => updateHeader('fax', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Lines */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 2: Activity Line Items</CardTitle>
                <CardDescription>Edit, add, or remove activity line items</CardDescription>
              </div>
              <Button onClick={addNewLine} size="sm" className="bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeLines.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No activity line items</p>
                <Button onClick={addNewLine} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Line
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {lines.map((line, index) => {
                  if (line.isDeleted) return null;

                  return (
                    <div key={line.aap_line_id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          Line {index + 1} {line.isNew && '(New)'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                          className="text-red-600 hover:bg-red-50"
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
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Activity Description *</Label>
                          <Input
                            value={line.activity_description}
                            onChange={(e) => updateLine(index, 'activity_description', e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Specific Output</Label>
                          <Input
                            value={line.specific_output || ''}
                            onChange={(e) => updateLine(index, 'specific_output', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Target Output</Label>
                          <Input
                            value={line.target_output || ''}
                            onChange={(e) => updateLine(index, 'target_output', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Proposed Cost (PGK) *</Label>
                          <Input
                            type="number"
                            value={line.proposed_cost || ''}
                            onChange={(e) => updateLine(index, 'proposed_cost', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Economic Item Code</Label>
                          <select
                            value={line.economic_item_code || ''}
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
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="border-t pt-4 flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Proposed Cost</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      K{totalProposedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Schedules */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Monthly Implementation Schedule</CardTitle>
            <CardDescription>Update monthly schedules for each activity</CardDescription>
          </CardHeader>
          <CardContent>
            {activeLines.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-gray-600">Please add activity line items first</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeLines.map((line) => (
                  <div key={line.aap_line_id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">
                      {line.item_no} - {line.activity_description}
                    </h4>
                    <div className="grid grid-cols-12 gap-2">
                      {MONTHS.map((month) => {
                        const monthSchedule = schedules[line.aap_line_id]?.[month.value];
                        const isScheduled = monthSchedule?.is_scheduled || false;

                        return (
                          <button
                            key={month.value}
                            onClick={() => toggleMonthSchedule(line.aap_line_id, month.value)}
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

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Review Changes</CardTitle>
            <CardDescription>Review your changes before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Header Information</h3>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Division</p>
                  <p className="font-medium">
                    {divisions.find(d => d.division_id === aap.division_id)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Program</p>
                  <p className="font-medium">
                    {programs.find(p => p.program_id === aap.program_id)?.program_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activity</p>
                  <p className="font-medium">
                    {activities.find(a => a.activity_id === aap.activity_id)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium">{aap.manager || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">
                Activity Line Items ({activeLines.length})
              </h3>
              <div className="space-y-2">
                {activeLines.map((line, index) => (
                  <div key={line.aap_line_id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium">
                        {line.item_no} - {line.activity_description}
                        {line.isNew && <Badge className="ml-2 text-xs">New</Badge>}
                      </p>
                      <p className="text-sm text-gray-600">{line.specific_output}</p>
                    </div>
                    <p className="font-semibold text-emerald-600">
                      K{line.proposed_cost.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

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

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1 || saving}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep === 4 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => saveChanges(false)}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => saveChanges(true)}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Save & Submit
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={saving}
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
