'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  User,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  employee_id: string;
  department: string;
  position: string;
  employment_type: string;
  hire_date: string;
  salary: number;
  status: string;
  photo_url?: string;
  national_id?: string;
  passport_number?: string;
  drivers_license?: string;
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string;
  const supabase = createClient();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error('Error loading employee:', error);
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">
          The employee you're looking for doesn't exist.
        </p>
        <Link href="/dashboard/employees">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: <Badge className="bg-green-600">Active</Badge>,
      on_leave: <Badge className="bg-yellow-600">On Leave</Badge>,
      terminated: <Badge className="bg-red-600">Terminated</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
      </div>

      {/* Employee Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700">
                {employee.first_name[0]}
                {employee.last_name[0]}
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {employee.first_name} {employee.last_name}
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">{employee.position}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600">
                      ID: {employee.employee_id}
                    </span>
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium">{employee.email}</p>
                  </div>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-medium">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Hire Date</p>
                    <p className="text-sm font-medium">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <User className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="emergency-contacts">
            <Users className="mr-2 h-4 w-4" />
            Emergency Contacts
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name</span>
                  <span className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee ID</span>
                  <span className="font-medium">{employee.employee_id}</span>
                </div>
                {employee.national_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">National ID</span>
                    <span className="font-medium">{employee.national_id}</span>
                  </div>
                )}
                {employee.passport_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passport</span>
                    <span className="font-medium">{employee.passport_number}</span>
                  </div>
                )}
                {employee.drivers_license && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver's License</span>
                    <span className="font-medium">{employee.drivers_license}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position</span>
                  <span className="font-medium">{employee.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employment Type</span>
                  <span className="font-medium">{employee.employment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hire Date</span>
                  <span className="font-medium">
                    {new Date(employee.hire_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  {getStatusBadge(employee.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Salary</span>
                  <span className="font-medium">
                    PGK {employee.salary.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency-contacts">
          <iframe
            src={`/dashboard/employees/${employeeId}/emergency-contacts`}
            className="w-full h-[800px] border-0"
            title="Emergency Contacts"
          />
        </TabsContent>

        <TabsContent value="documents">
          <iframe
            src={`/dashboard/employees/${employeeId}/documents`}
            className="w-full h-[800px] border-0"
            title="Documents"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
