export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_commands: {
        Row: {
          control_command: string | null
          created_at: string
          evaluation_command: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          control_command?: string | null
          created_at?: string
          evaluation_command?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          control_command?: string | null
          created_at?: string
          evaluation_command?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          created_at: string
          file_name: string
          id: string
          page_content: string
          question_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          page_content: string
          question_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          page_content?: string
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      correct_answers: {
        Row: {
          answer_id: string | null
          correct_answer: string
          correct_id: string
          created_at: string
          evidence: string
          id: string
          question: string
          staff_email: string
          status: string
        }
        Insert: {
          answer_id?: string | null
          correct_answer: string
          correct_id: string
          created_at?: string
          evidence: string
          id?: string
          question: string
          staff_email: string
          status?: string
        }
        Update: {
          answer_id?: string | null
          correct_answer?: string
          correct_id?: string
          created_at?: string
          evidence?: string
          id?: string
          question?: string
          staff_email?: string
          status?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      deleted_files: {
        Row: {
          deleted_at: string
          file_name: string
          file_url: string
          id: string
          user_id: string | null
        }
        Insert: {
          deleted_at?: string
          file_name: string
          file_url: string
          id?: string
          user_id?: string | null
        }
        Update: {
          deleted_at?: string
          file_name?: string
          file_url?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feedback_history: {
        Row: {
          control_evaluation: string | null
          created_at: string
          description: string | null
          document_evaluation: string | null
          feedback_evaluation: string | null
          feedback_remediation: string | null
          from_audit: string | null
          id: string
          last_update: string
          question: string | null
          question_id: string
          remediation_guidance: string | null
          staff_email: string
        }
        Insert: {
          control_evaluation?: string | null
          created_at?: string
          description?: string | null
          document_evaluation?: string | null
          feedback_evaluation?: string | null
          feedback_remediation?: string | null
          from_audit?: string | null
          id?: string
          last_update?: string
          question?: string | null
          question_id: string
          remediation_guidance?: string | null
          staff_email: string
        }
        Update: {
          control_evaluation?: string | null
          created_at?: string
          description?: string | null
          document_evaluation?: string | null
          feedback_evaluation?: string | null
          feedback_remediation?: string | null
          from_audit?: string | null
          id?: string
          last_update?: string
          question?: string | null
          question_id?: string
          remediation_guidance?: string | null
          staff_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          content: string
          control_evaluation_by_ai: string | null
          control_rating_by_ai: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          document_evaluation_by_ai: string | null
          evidence: string | null
          feedback_for_remediation: string | null
          feedback_to_ai: string | null
          field_audit_findings: string | null
          id: string
          iso_27001_control: string | null
          question_id: string | null
          remediation_guidance: string | null
          source: string | null
        }
        Insert: {
          answer?: string | null
          content: string
          control_evaluation_by_ai?: string | null
          control_rating_by_ai?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          document_evaluation_by_ai?: string | null
          evidence?: string | null
          feedback_for_remediation?: string | null
          feedback_to_ai?: string | null
          field_audit_findings?: string | null
          id?: string
          iso_27001_control?: string | null
          question_id?: string | null
          remediation_guidance?: string | null
          source?: string | null
        }
        Update: {
          answer?: string | null
          content?: string
          control_evaluation_by_ai?: string | null
          control_rating_by_ai?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          document_evaluation_by_ai?: string | null
          evidence?: string | null
          feedback_for_remediation?: string | null
          feedback_to_ai?: string | null
          field_audit_findings?: string | null
          id?: string
          iso_27001_control?: string | null
          question_id?: string | null
          remediation_guidance?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_or_staff: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
