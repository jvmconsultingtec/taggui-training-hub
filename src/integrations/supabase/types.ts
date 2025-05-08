export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      training_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          training_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          training_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_assignments_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_group_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          group_id: string
          id: string
          training_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          group_id: string
          id?: string
          training_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          group_id?: string
          id?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_group_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_group_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_group_assignments_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed_at: string | null
          id: string
          last_viewed_at: string
          progress_pct: number
          training_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          last_viewed_at?: string
          progress_pct?: number
          training_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          last_viewed_at?: string
          progress_pct?: number
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          author: string | null
          company_id: string
          created_at: string | null
          description: string | null
          duration_min: number
          id: string
          tags: string[] | null
          title: string
          video_type: Database["public"]["Enums"]["video_type"]
          video_url: string
          visibility: Database["public"]["Enums"]["visibility"] | null
        }
        Insert: {
          author?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          duration_min: number
          id?: string
          tags?: string[] | null
          title: string
          video_type: Database["public"]["Enums"]["video_type"]
          video_url: string
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Update: {
          author?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          duration_min?: number
          id?: string
          tags?: string[] | null
          title?: string
          video_type?: Database["public"]["Enums"]["video_type"]
          video_url?: string
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_group_members: {
        Row: {
          added_at: string | null
          added_by: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_group_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "user_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          linkedin_id: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id: string
          linkedin_id?: string | null
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          linkedin_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_access: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
      check_user_access_for_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      criar_usuario: {
        Args: {
          user_id: string
          user_email: string
          user_nome: string
          user_tenant: string
          user_role: string
        }
        Returns: undefined
      }
      fetch_company_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          linkedin_id: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
        }[]
      }
      get_current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_id: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id?: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      promover_a_admin: {
        Args: { email_usuario: string }
        Returns: string
      }
      user_belongs_to_company: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
      user_has_training_access: {
        Args: { p_user_id: string; p_training_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "ADMIN" | "MANAGER" | "COLLABORATOR"
      video_type: "UPLOAD" | "YOUTUBE"
      visibility: "PUBLIC" | "PRIVATE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["ADMIN", "MANAGER", "COLLABORATOR"],
      video_type: ["UPLOAD", "YOUTUBE"],
      visibility: ["PUBLIC", "PRIVATE"],
    },
  },
} as const
