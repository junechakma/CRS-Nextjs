export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_log_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_type: string
          backup_url: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          status: string
        }
        Insert: {
          backup_type?: string
          backup_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
        }
        Update: {
          backup_type?: string
          backup_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_code: string
          course_title: string
          created_at: string | null
          credit_hours: number | null
          department_id: string
          faculty_id: string
          id: string
          sections: Json | null
          semester_id: string
          settings: Json | null
          status: string | null
          teacher_id: string
          university_id: string
          updated_at: string | null
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string | null
          credit_hours?: number | null
          department_id: string
          faculty_id: string
          id?: string
          sections?: Json | null
          semester_id: string
          settings?: Json | null
          status?: string | null
          teacher_id: string
          university_id: string
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string | null
          credit_hours?: number | null
          department_id?: string
          faculty_id?: string
          id?: string
          sections?: Json | null
          semester_id?: string
          settings?: Json | null
          status?: string | null
          teacher_id?: string
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_courses_department_id"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_courses_faculty_id"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_courses_semester_id"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_courses_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_courses_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          faculty_id: string
          id: string
          moderator_id: string | null
          name: string
          settings: Json | null
          stats: Json | null
          status: string | null
          university_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          faculty_id: string
          id?: string
          moderator_id?: string | null
          name: string
          settings?: Json | null
          stats?: Json | null
          status?: string | null
          university_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          faculty_id?: string
          id?: string
          moderator_id?: string | null
          name?: string
          settings?: Json | null
          stats?: Json | null
          status?: string | null
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_departments_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_faculty_id"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_moderator_id"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      durations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          label: string
          minutes: number
          university_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          label: string
          minutes: number
          university_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          label?: string
          minutes?: number
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "durations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "durations_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      encryption_keys: {
        Row: {
          created_at: string | null
          id: string
          key_name: string
          key_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_name: string
          key_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faculties: {
        Row: {
          admin_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          stats: Json | null
          status: string | null
          university_id: string
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          stats?: Json | null
          status?: string | null
          university_id: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          stats?: Json | null
          status?: string | null
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_faculties_admin_id"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_faculties_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_faculties_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_attempts: {
        Row: {
          attempted_at: string | null
          attempts_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string | null
          attempts_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string | null
          attempts_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      question_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          university_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          university_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          university_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          options: Json | null
          priority: number | null
          required: boolean | null
          scale: number | null
          text: string
          type: string
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          options?: Json | null
          priority?: number | null
          required?: boolean | null
          scale?: number | null
          text: string
          type: string
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          options?: Json | null
          priority?: number | null
          required?: boolean | null
          scale?: number | null
          text?: string
          type?: string
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      response_sessions: {
        Row: {
          anonymous_key: string
          course_id: string
          created_at: string | null
          department_id: string
          duration_minutes: number
          end_time: string
          faculty_id: string
          id: string
          questions: Json
          room_number: string | null
          section: string
          semester_id: string
          session_date: string
          settings: Json | null
          start_time: string
          stats: Json | null
          status: string | null
          teacher_id: string
          university_id: string
          updated_at: string | null
        }
        Insert: {
          anonymous_key: string
          course_id: string
          created_at?: string | null
          department_id: string
          duration_minutes?: number
          end_time: string
          faculty_id: string
          id?: string
          questions?: Json
          room_number?: string | null
          section: string
          semester_id: string
          session_date?: string
          settings?: Json | null
          start_time?: string
          stats?: Json | null
          status?: string | null
          teacher_id: string
          university_id: string
          updated_at?: string | null
        }
        Update: {
          anonymous_key?: string
          course_id?: string
          created_at?: string | null
          department_id?: string
          duration_minutes?: number
          end_time?: string
          faculty_id?: string
          id?: string
          questions?: Json
          room_number?: string | null
          section?: string
          semester_id?: string
          session_date?: string
          settings?: Json | null
          start_time?: string
          stats?: Json | null
          status?: string | null
          teacher_id?: string
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_response_sessions_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_response_sessions_department_id"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_response_sessions_faculty_id"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_response_sessions_semester_id"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_response_sessions_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_response_sessions_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          course_id: string
          department_id: string
          faculty_id: string
          id: string
          metadata: Json | null
          response_data: Json
          session_id: string
          status: string | null
          student_anonymous_id: string
          submission_time: string | null
          teacher_id: string
          university_id: string
        }
        Insert: {
          course_id: string
          department_id: string
          faculty_id: string
          id?: string
          metadata?: Json | null
          response_data?: Json
          session_id: string
          status?: string | null
          student_anonymous_id: string
          submission_time?: string | null
          teacher_id: string
          university_id: string
        }
        Update: {
          course_id?: string
          department_id?: string
          faculty_id?: string
          id?: string
          metadata?: Json | null
          response_data?: Json
          session_id?: string
          status?: string | null
          student_anonymous_id?: string
          submission_time?: string | null
          teacher_id?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_responses_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_responses_department_id"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_responses_faculty_id"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_responses_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "response_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_responses_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_responses_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          academic_year: string
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          name: string
          registration_end: string | null
          registration_start: string | null
          start_date: string | null
          stats: Json | null
          status: string | null
          university_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          name: string
          registration_end?: string | null
          registration_start?: string | null
          start_date?: string | null
          stats?: Json | null
          status?: string | null
          university_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          name?: string
          registration_end?: string | null
          registration_start?: string | null
          start_date?: string | null
          stats?: Json | null
          status?: string | null
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_semesters_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_semesters_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          category: string | null
          description: string | null
          is_sensitive: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          description?: string | null
          is_sensitive?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          description?: string | null
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_system_config_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_feedback: {
        Row: {
          action_items: Json | null
          course_id: string
          created_at: string | null
          feedback_date: string
          feedback_text: string | null
          id: string
          improvement_areas: Json | null
          is_public: boolean | null
          session_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          course_id: string
          created_at?: string | null
          feedback_date?: string
          feedback_text?: string | null
          id?: string
          improvement_areas?: Json | null
          is_public?: boolean | null
          session_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          course_id?: string
          created_at?: string | null
          feedback_date?: string
          feedback_text?: string | null
          id?: string
          improvement_areas?: Json | null
          is_public?: boolean | null
          session_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_feedback_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_teacher_feedback_session_id"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "response_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_teacher_feedback_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      template_questions: {
        Row: {
          created_at: string | null
          custom_priority: number | null
          id: string
          is_required: boolean | null
          order_index: number
          question_id: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          custom_priority?: number | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          question_id: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          custom_priority?: number | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          question_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "question_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          address: string | null
          admin_id: string | null
          city: string | null
          code: string
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          logo_path: string | null
          name: string
          phone: string | null
          postal_code: string | null
          settings: Json | null
          state: string | null
          stats: Json | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_id?: string | null
          city?: string | null
          code: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          logo_path?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          state?: string | null
          stats?: Json | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_id?: string | null
          city?: string | null
          code?: string
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          logo_path?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          state?: string | null
          stats?: Json | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_universities_admin_id"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_universities_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      university_applications: {
        Row: {
          admin_email: string
          admin_name: string
          admin_password_temp: string | null
          admin_phone: string | null
          application_status: string | null
          created_at: string | null
          id: string
          rejection_reason: string | null
          review_date: string | null
          reviewed_by: string | null
          university_address: string | null
          university_city: string | null
          university_code: string
          university_country: string | null
          university_email: string | null
          university_name: string
          university_phone: string | null
          university_postal_code: string | null
          university_state: string | null
          university_website: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_email: string
          admin_name: string
          admin_password_temp?: string | null
          admin_phone?: string | null
          application_status?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          review_date?: string | null
          reviewed_by?: string | null
          university_address?: string | null
          university_city?: string | null
          university_code: string
          university_country?: string | null
          university_email?: string | null
          university_name: string
          university_phone?: string | null
          university_postal_code?: string | null
          university_state?: string | null
          university_website?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_email?: string
          admin_name?: string
          admin_password_temp?: string | null
          admin_phone?: string | null
          application_status?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          review_date?: string | null
          reviewed_by?: string | null
          university_address?: string | null
          university_city?: string | null
          university_code?: string
          university_country?: string | null
          university_email?: string | null
          university_name?: string
          university_phone?: string | null
          university_postal_code?: string | null
          university_state?: string | null
          university_website?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_university_applications_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_university_applications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      university_template_activations: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          id: string
          is_active: boolean
          template_id: string
          university_id: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          id?: string
          is_active?: boolean
          template_id: string
          university_id: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          id?: string
          is_active?: boolean
          template_id?: string
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_template_activations_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_template_activations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "question_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_template_activations_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          application_date: string | null
          application_id: string | null
          approval_date: string | null
          approval_status: string | null
          approved_by: string | null
          auth_user_id: string | null
          created_at: string | null
          department_id: string | null
          email: string
          faculty_id: string | null
          id: string
          initial: string | null
          last_login: string | null
          last_password_change: string | null
          login_count: number | null
          name: string
          password_change_required: boolean | null
          password_hash: string | null
          phone: string | null
          role: string
          status: string | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          application_date?: string | null
          application_id?: string | null
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          faculty_id?: string | null
          id?: string
          initial?: string | null
          last_login?: string | null
          last_password_change?: string | null
          login_count?: number | null
          name: string
          password_change_required?: boolean | null
          password_hash?: string | null
          phone?: string | null
          role: string
          status?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          application_date?: string | null
          application_id?: string | null
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          faculty_id?: string | null
          id?: string
          initial?: string | null
          last_login?: string | null
          last_password_change?: string | null
          login_count?: number | null
          name?: string
          password_change_required?: boolean | null
          password_hash?: string | null
          phone?: string | null
          role?: string
          status?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_users_department_id"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_users_faculty_id"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_users_university_id"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "university_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_university_application: {
        Args: {
          p_application_id: string
          p_super_admin_id: string
          p_university_settings?: Json
        }
        Returns: Json
      }
      auto_activate_default_templates_for_university: {
        Args: { p_university_id: string }
        Returns: undefined
      }
      change_password: {
        Args: {
          p_new_password: string
          p_old_password: string
          p_user_id: string
        }
        Returns: Json
      }
      change_password_authenticated: {
        Args: {
          p_current_password: string
          p_ip_address?: string
          p_new_password: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: {
          email_log_id: string
          email_sent: boolean
          message: string
          success: boolean
        }[]
      }
      check_password_change_required: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_university_code_exists: {
        Args: { p_code: string }
        Returns: boolean
      }
      cleanup_expired_password_tokens: { Args: never; Returns: number }
      copy_default_template_to_university: {
        Args: {
          p_created_by?: string
          p_new_template_name?: string
          p_template_id?: string
          p_university_id: string
        }
        Returns: string
      }
      create_default_template: { Args: never; Returns: string }
      create_department: {
        Args: {
          p_department_code: string
          p_department_description: string
          p_department_name: string
          p_faculty_id: string
          p_moderator_email: string
          p_moderator_name: string
          p_moderator_phone: string
          p_temp_password: string
          p_university_admin_id: string
        }
        Returns: Json
      }
      create_faculty: {
        Args: {
          p_admin_email: string
          p_admin_name: string
          p_admin_phone: string
          p_faculty_code: string
          p_faculty_description: string
          p_faculty_name: string
          p_temp_password: string
          p_university_admin_id: string
        }
        Returns: Json
      }
      create_semester: {
        Args: {
          p_academic_year: string
          p_end_date: string
          p_is_current?: boolean
          p_registration_end?: string
          p_registration_start?: string
          p_semester_name: string
          p_start_date: string
          p_university_admin_id: string
        }
        Returns: Json
      }
      create_super_admin: {
        Args: { p_email: string; p_name: string; p_password: string }
        Returns: Json
      }
      create_system_backup: {
        Args: { admin_id: string }
        Returns: {
          backup_id: string
          backup_url: string
          status: string
        }[]
      }
      create_system_backup_with_format: {
        Args: { admin_id: string; export_format?: string }
        Returns: {
          backup_id: string
          backup_url: string
          file_size: number
          format: string
          status: string
        }[]
      }
      create_teacher_record: {
        Args: {
          p_approved_by: string
          p_auth_user_id: string
          p_department_id: string
          p_email: string
          p_faculty_id: string
          p_initial: string
          p_name: string
          p_phone: string
          p_university_id: string
        }
        Returns: Json
      }
      create_university_admin_by_super_admin: {
        Args: {
          p_auth_user_id: string
          p_email: string
          p_name: string
          p_phone?: string
          p_super_admin_id: string
        }
        Returns: Json
      }
      decrypt_data: { Args: { encrypted_data: string }; Returns: string }
      delete_auth_user: { Args: { user_id: string }; Returns: undefined }
      delete_data_in_date_range: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          deleted_count: number
          table_name: string
        }[]
      }
      delete_teacher_by_admin: {
        Args: { p_teacher_id: string; p_university_admin_id: string }
        Returns: Json
      }
      delete_template_with_cleanup: {
        Args: { p_template_id: string }
        Returns: undefined
      }
      generate_and_send_new_password: {
        Args: { p_email: string; p_ip_address?: string; p_user_agent?: string }
        Returns: {
          email_log_id: string
          email_sent: boolean
          message: string
          new_password: string
          success: boolean
          user_name: string
          user_role: string
        }[]
      }
      generate_anonymous_key: { Args: { length?: number }; Returns: string }
      get_active_templates_for_university: {
        Args: { p_university_id: string }
        Returns: {
          created_at: string
          is_default: boolean
          question_count: number
          template_description: string
          template_id: string
          template_name: string
        }[]
      }
      get_all_public_universities: { Args: never; Returns: Json }
      get_current_user_department_id: { Args: never; Returns: string }
      get_current_user_faculty_id: { Args: never; Returns: string }
      get_current_user_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_current_user_university_id: { Args: never; Returns: string }
      get_encryption_key: { Args: never; Returns: string }
      get_excel_backup_data: {
        Args: { admin_id: string }
        Returns: {
          data: Json
          sheet_name: string
        }[]
      }
      get_growth_trends: {
        Args: never
        Returns: {
          current_value: number
          growth_percentage: number
          metric_name: string
          previous_value: number
          trend_direction: string
        }[]
      }
      get_monthly_billing_report: {
        Args: { p_month?: number; p_year?: number }
        Returns: {
          billing_month: string
          estimated_cost: number
          responses_collected: number
          sessions_created: number
          total_usage_score: number
          unique_active_students: number
          unique_active_teachers: number
          university_id: string
          university_name: string
        }[]
      }
      get_overall_system_metrics: {
        Args: never
        Returns: {
          active_sessions_today: number
          overall_response_rate: number
          responses_today: number
          total_courses: number
          total_departments: number
          total_faculties: number
          total_responses: number
          total_sessions: number
          total_universities: number
          total_users: number
        }[]
      }
      get_password_change_history: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          change_date: string
          ip_address: string
          method: string
          user_agent: string
        }[]
      }
      get_password_reset_attempts: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          attempted_at: string
          attempts_count: number
          blocked_until: string
          email: string
          failure_reason: string
          id: string
          ip_address: string
          success: boolean
        }[]
      }
      get_public_university_info: {
        Args: { p_university_code: string }
        Returns: Json
      }
      get_sql_backup_data: { Args: { admin_id: string }; Returns: string }
      get_system_setting: { Args: { setting_key: string }; Returns: Json }
      get_template_with_questions: {
        Args: { p_template_id: string }
        Returns: {
          created_at: string
          is_default: boolean
          question_category: string
          question_id: string
          question_is_active: boolean
          question_options: Json
          question_priority: number
          question_required: boolean
          question_scale: number
          question_text: string
          question_type: string
          template_custom_priority: number
          template_description: string
          template_id: string
          template_name: string
          template_question_order: number
          template_question_required: boolean
          usage_count: number
        }[]
      }
      get_university_active_templates: {
        Args: { p_university_id: string }
        Returns: {
          activation_status: boolean
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          university_id: string
          updated_at: string
        }[]
      }
      get_university_application_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_university_usage_metrics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          active_students: number
          active_teachers: number
          avg_session_duration: number
          last_activity: string
          response_rate: number
          total_responses: number
          total_sessions: number
          university_id: string
          university_name: string
        }[]
      }
      get_user_university_id: { Args: never; Returns: string }
      get_users_by_role: {
        Args: never
        Returns: {
          role: string
          user_count: number
        }[]
      }
      increment_template_usage: {
        Args: { p_template_id: string }
        Returns: undefined
      }
      insert_default_questions: { Args: never; Returns: undefined }
      is_maintenance_mode: { Args: never; Returns: boolean }
      is_university_admin: { Args: never; Returns: boolean }
      login: {
        Args: {
          p_email: string
          p_ip_address?: unknown
          p_password: string
          p_user_agent?: string
        }
        Returns: Json
      }
      register_university_admin: {
        Args: {
          p_email: string
          p_name: string
          p_password: string
          p_phone: string
          p_university_address?: string
          p_university_city?: string
          p_university_code: string
          p_university_country?: string
          p_university_email?: string
          p_university_name: string
          p_university_phone?: string
          p_university_postal_code?: string
          p_university_state?: string
          p_university_website?: string
        }
        Returns: Json
      }
      reject_university_application: {
        Args: {
          p_application_id: string
          p_rejection_reason: string
          p_super_admin_id: string
        }
        Returns: Json
      }
      reorder_template_questions: {
        Args: { p_question_orders: Json; p_template_id: string }
        Returns: undefined
      }
      require_password_change: {
        Args: { p_admin_id: string; p_reason?: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      reset_password_with_token: {
        Args: {
          p_ip_address?: string
          p_new_password: string
          p_token: string
          p_user_agent?: string
        }
        Returns: {
          email_log_id: string
          email_sent: boolean
          message: string
          success: boolean
        }[]
      }
      rpc_check_university_code_exists: {
        Args: { code_to_check: string }
        Returns: Json
      }
      set_current_semester: {
        Args: { p_semester_id: string; p_university_admin_id: string }
        Returns: Json
      }
      set_template_active_status: {
        Args: {
          p_is_active: boolean
          p_template_id: string
          p_university_id?: string
        }
        Returns: undefined
      }
      update_teacher_by_admin: {
        Args: {
          p_department_id?: string
          p_teacher_email?: string
          p_teacher_id: string
          p_teacher_initial?: string
          p_teacher_name?: string
          p_teacher_phone?: string
          p_university_admin_id: string
        }
        Returns: Json
      }
      update_teacher_status_by_admin: {
        Args: {
          p_status: string
          p_teacher_id: string
          p_university_admin_id: string
        }
        Returns: Json
      }
      update_university_logo: {
        Args: { p_logo_path: string; p_university_id: string }
        Returns: Json
      }
      upsert_university_encrypted: {
        Args: {
          p_address?: string
          p_admin_id?: string
          p_city?: string
          p_code?: string
          p_country?: string
          p_created_by?: string
          p_email?: string
          p_id?: string
          p_name?: string
          p_phone?: string
          p_postal_code?: string
          p_settings?: Json
          p_state?: string
          p_status?: string
          p_website?: string
        }
        Returns: string
      }
      validate_password_reset_token: {
        Args: { p_token: string }
        Returns: {
          message: string
          success: boolean
          user_email: string
          user_id: string
          user_name: string
          user_role: string
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

