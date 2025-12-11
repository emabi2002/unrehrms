"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { exportCostCentresToExcel } from "@/lib/excel-export";

interface CostCentre {
  id: number;
  code: string;
  name: string;
  type: string;
  parent_id: number | null;
  head_user_id: string | null;
  is_active: boolean;
  created_at: string;
  parent?: {
    name: string;
  };
  head?: {
    full_name: string;
  };
}

export default function CostCentresPage() {
  const [costCentres, setCostCentres] = useState<CostCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<CostCentre | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("School");
  const [parentId, setParentId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCostCentres();
  }, []);

  async function loadCostCentres() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cost_centres')
        .select(`
          *,
          parent:cost_centres!cost_centres_parent_id_fkey(name),
          head:user_profiles(full_name)
        `)
        .order('code');

      if (error) throw error;
      setCostCentres(data as CostCentre[] || []);
    } catch (error: any) {
      console.error('Error loading cost centres:', error);
      toast.error('Failed to load cost centres. Please try again.');
      setCostCentres([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditMode(false);
    setSelectedCentre(null);
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(centre: CostCentre) {
    setEditMode(true);
    setSelectedCentre(centre);
    setCode(centre.code);
    setName(centre.name);
    setType(centre.type);
    setParentId(centre.parent_id?.toString() || "");
    setIsActive(centre.is_active);
    setDialogOpen(true);
  }

  function resetForm() {
    setCode("");
    setName("");
    setType("School");
    setParentId("");
    setIsActive(true);
    setErrors({});
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "Cost centre code is required";
    } else if (!/^[A-Z0-9-]+$/.test(code)) {
      newErrors.code = "Code must be uppercase letters, numbers, and hyphens only";
    }

    if (!name.trim()) {
      newErrors.name = "Cost centre name is required";
    }

    if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const costCentreData = {
        code: code.toUpperCase(),
        name: name.trim(),
        type,
        parent_id: parentId ? parseInt(parentId) : null,
        is_active: isActive,
      };

      if (editMode && selectedCentre) {
        const { error } = await supabase
          .from('cost_centres')
          // @ts-expect-error - Supabase type mismatch
          .update(costCentreData)
          .eq('id', selectedCentre.id);

        if (error) throw error;
        toast.success("Cost centre updated successfully!");
      } else {
        const { error } = await supabase
          .from('cost_centres')
          .insert(costCentreData as any);

        if (error) throw error;
        toast.success("Cost centre created successfully!");
      }

      setDialogOpen(false);
      loadCostCentres();
      resetForm();
    } catch (error: any) {
      console.error('Error saving cost centre:', error);
      if (error.code === '23505') {
        toast.error("Cost centre code already exists");
      } else {
        toast.error("Failed to save cost centre");
      }
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cost_centres')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Cost centre deleted successfully!");
      loadCostCentres();
    } catch (error) {
      console.error('Error deleting cost centre:', error);
      toast.error("Failed to delete cost centre. It may be in use.");
    }
  }

  const filteredCentres = costCentres.filter(centre =>
    centre.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centre.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: costCentres.length,
    faculties: costCentres.filter(c => c.type === 'Faculty').length,
    schools: costCentres.filter(c => c.type === 'School').length,
    divisions: costCentres.filter(c => c.type === 'Division').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cost Centres</h1>
          <p className="text-slate-600">Manage organizational structure and budget centres</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCostCentresToExcel(costCentres)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
            onClick={openCreateDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Cost Centre
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Total</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Faculties</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.faculties}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Schools</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.schools}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600">Divisions</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.divisions}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by code, name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Cost Centres Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-unre-green-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-left text-sm font-medium text-slate-600">
                  <th className="p-4">Code</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Parent</th>
                  <th className="p-4">Head</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCentres.map((centre) => (
                  <tr key={centre.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {centre.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-900">{centre.name}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{centre.type}</Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {centre.parent?.name || "-"}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {centre.head?.full_name || "-"}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          centre.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {centre.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(centre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(centre.id, centre.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredCentres.length === 0 && !loading && (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No cost centres found
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm
                ? "Try adjusting your search or create a new cost centre"
                : "Get started by creating your first cost centre"}
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Cost Centre
            </Button>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Cost Centre" : "Create New Cost Centre"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Update the cost centre information below."
                : "Add a new cost centre to the organizational structure."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Cost Centre Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., SOA, SOF, ADMIN"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.code}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., School of Agriculture"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="Division">Division</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Unit">Unit</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parent */}
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Cost Centre (Optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Top Level)</SelectItem>
                  {costCentres
                    .filter(c => c.id !== selectedCentre?.id)
                    .map((centre) => (
                      <SelectItem key={centre.id} value={centre.id.toString()}>
                        {centre.code} - {centre.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(v) => setIsActive(v === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
            >
              {editMode ? "Update" : "Create"} Cost Centre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
