import { createClient } from '@/lib/supabase';
import type {
  EmergencyContact,
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from '@/types/emergency-contact';

const supabase = createClient();

export async function getEmergencyContacts(employeeId: string) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('employee_id', employeeId)
    .order('priority');

  if (error) throw error;
  return data as EmergencyContact[];
}

export async function getEmergencyContactById(contactId: string) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) throw error;
  return data as EmergencyContact;
}

export async function createEmergencyContact(input: CreateEmergencyContactInput) {
  // If this is set as primary, unset other primary contacts
  if (input.is_primary) {
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('employee_id', input.employee_id)
      .eq('is_primary', true);
  }

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as EmergencyContact;
}

export async function updateEmergencyContact(
  contactId: string,
  input: UpdateEmergencyContactInput
) {
  // If setting as primary, unset other primary contacts first
  if (input.is_primary) {
    const contact = await getEmergencyContactById(contactId);
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('employee_id', contact.employee_id)
      .eq('is_primary', true);
  }

  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(input)
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data as EmergencyContact;
}

export async function deleteEmergencyContact(contactId: string) {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
}

export async function setPrimaryContact(contactId: string, employeeId: string) {
  // Unset all primary contacts for this employee
  await supabase
    .from('emergency_contacts')
    .update({ is_primary: false })
    .eq('employee_id', employeeId)
    .eq('is_primary', true);

  // Set this contact as primary
  return updateEmergencyContact(contactId, { is_primary: true });
}
