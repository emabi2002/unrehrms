export interface EmergencyContact {
  id: string;
  created_at: string;
  updated_at: string;
  employee_id: string;

  // Contact Details
  full_name: string;
  relationship: string;
  phone: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;

  // Priority
  priority: number;
  is_primary: boolean;

  // Notes
  notes?: string;
}

export interface CreateEmergencyContactInput {
  employee_id: string;
  full_name: string;
  relationship: string;
  phone: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  priority?: number;
  is_primary?: boolean;
  notes?: string;
}

export interface UpdateEmergencyContactInput {
  full_name?: string;
  relationship?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  priority?: number;
  is_primary?: boolean;
  notes?: string;
}
