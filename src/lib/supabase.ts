import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          amount: number;
          type: 'income' | 'expense';
          category: string;
          method: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          objective: string;
          target_amount: number;
          target_date: string | null;
          status: 'active' | 'completed' | 'cancelled';
          progress_percentage: number;
          notes: string | null;
          created_at: string;
        };
      };
      library_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          type: 'article' | 'course' | 'book' | 'video' | 'note' | 'other';
          topic: string | null;
          source: string | null;
          link: string | null;
          tags: string[] | null;
          summary: string | null;
          insight: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'archived';
          created_at: string;
        };
      };
      professional_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          role: string | null;
          last_contact: string | null;
          next_contact: string | null;
          notes: string | null;
          industry: string | null;
          email: string | null;
          phone: string | null;
          created_at: string;
        };
      };
      objectives: {
        Row: {
          id: string;
          user_id: string;
          objective: string;
          area: 'personal' | 'professional';
          period: string;
          priority: 'low' | 'medium' | 'high' | 'critical';
          status: 'active' | 'on_track' | 'at_risk' | 'completed' | 'cancelled';
          description: string | null;
          created_at: string;
        };
      };
      key_results: {
        Row: {
          id: string;
          user_id: string;
          objective_id: string;
          key_result: string;
          metric: string;
          baseline: number;
          target: number;
          current_value: number;
          target_date: string | null;
          progress_percentage: number;
          created_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          area: 'personal' | 'professional';
          type: 'work' | 'personal' | 'learning' | 'other' | null;
          status: 'backlog' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'critical';
          start_date: string | null;
          deadline: string | null;
          owner: string | null;
          stakeholders: string[] | null;
          expected_impact: string | null;
          risks: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task: string;
          status: 'todo' | 'in_progress' | 'done';
          priority: 'low' | 'medium' | 'high' | 'critical';
          estimation: number | null;
          sprint: string | null;
          assigned_to: string | null;
          deadline: string | null;
          tags: string[] | null;
          blockers: string | null;
          created_at: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          habit: string;
          category: 'health' | 'language' | 'productivity' | 'learning' | 'other';
          frequency: 'daily' | 'weekly' | 'monthly';
          trigger: string | null;
          action: string | null;
          reward: string | null;
          metric_type: 'boolean' | 'minutes' | 'repetitions' | 'count';
          active: boolean;
          consistency_score: number;
          created_at: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          log_date: string;
          completed: boolean;
          value: number | null;
          note: string | null;
          energy_level: number | null;
          created_at: string;
        };
      };
    };
  };
};
