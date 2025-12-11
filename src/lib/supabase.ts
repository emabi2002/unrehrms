import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Helper function to get user profile with roles
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user_roles (
        id,
        role_id,
        cost_centre_id,
        approval_limit,
        roles (
          id,
          name,
          description
        ),
        cost_centres (
          id,
          code,
          name
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
