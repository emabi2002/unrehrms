export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          employee_id: string | null;
          phone: string | null;
          department: string | null;
          position: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      cost_centres: {
        Row: {
          id: number;
          code: string;
          name: string;
          parent_id: number | null;
          type: string;
          head_user_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      budget_lines: {
        Row: {
          id: number;
          cost_centre_id: number;
          budget_year: number;
          pgas_vote_code: string;
          pgas_sub_item: string | null;
          aap_code: string | null;
          description: string;
          category: string | null;
          original_amount: number;
          ytd_expenditure: number;
          committed_amount: number;
          available_amount: number;
          last_pgas_sync: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      ge_requests: {
        Row: {
          id: number;
          request_number: string;
          requester_id: string;
          cost_centre_id: number;
          budget_line_id: number;
          expense_type_id: number;
          supplier_id: number | null;
          title: string;
          description: string;
          justification: string;
          required_date: string | null;
          total_amount: number;
          status: string;
          current_approver_role: string | null;
          priority: string;
          submitted_at: string | null;
          approved_at: string | null;
          committed_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ge_requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ge_requests']['Insert']>;
      };
      ge_request_items: {
        Row: {
          id: number;
          ge_request_id: number;
          item_number: number;
          description: string;
          quantity: number;
          unit_price: number;
          total_amount: number;
          notes: string | null;
          created_at: string;
        };
      };
      ge_approvals: {
        Row: {
          id: number;
          ge_request_id: number;
          approver_id: string;
          role_name: string;
          approval_level: number;
          action: string;
          comments: string | null;
          acted_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
      };
      commitments: {
        Row: {
          id: number;
          ge_request_id: number;
          commitment_number: string;
          amount: number;
          budget_line_id: number;
          cost_centre_id: number;
          financial_year: number;
          status: string;
          remaining_amount: number | null;
          created_by: string;
          created_at: string;
        };
      };
      payment_vouchers: {
        Row: {
          id: number;
          voucher_number: string;
          ge_request_id: number;
          commitment_id: number | null;
          payee_name: string;
          payment_date: string;
          payment_method: string;
          bank_name: string | null;
          account_number: string | null;
          cheque_number: string | null;
          bank_reference: string | null;
          amount: number;
          description: string | null;
          approved_by: string | null;
          processed_by: string | null;
          status: string;
          paid_at: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          message: string;
          type: string;
          entity_type: string | null;
          entity_id: number | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
      };
    };
  };
};

export type GERequest = Database['public']['Tables']['ge_requests']['Row'];
export type GERequestInsert = Database['public']['Tables']['ge_requests']['Insert'];
export type GERequestUpdate = Database['public']['Tables']['ge_requests']['Update'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type CostCentre = Database['public']['Tables']['cost_centres']['Row'];
export type BudgetLine = Database['public']['Tables']['budget_lines']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export type GEStatus =
  | 'draft'
  | 'submitted'
  | 'pending_hod'
  | 'pending_dean'
  | 'pending_bursar'
  | 'pending_registrar'
  | 'pending_vc'
  | 'approved'
  | 'committed'
  | 'partial_paid'
  | 'paid'
  | 'rejected'
  | 'returned'
  | 'cancelled';
