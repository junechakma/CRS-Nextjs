import { supabase } from '../../../lib/supabase'

export interface CourseCLO {
  id: string
  course_id: string
  clo_number: number
  clo: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface CreateCLOData {
  course_id: string
  clo_number: number
  clo: string
}

// Note: Mappings are done on-the-fly by AI, not stored in database
// These interfaces are kept for potential future use

export class CLOService {
  /**
   * Get all CLOs for a course
   */
  static async getCourseCLOs(courseId: string): Promise<CourseCLO[]> {
    try {
      const { data, error } = await supabase
        .from('course_clos')
        .select('*')
        .eq('course_id', courseId)
        .order('clo_number', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching CLOs:', error)
      return []
    }
  }

  /**
   * Create a new CLO with AI-powered analysis
   */
  static async createCLO(cloData: CreateCLOData, teacherId: string): Promise<{ success: boolean; error?: string; clo?: CourseCLO }> {
    try {
      // Check if CLO number already exists for this course
      const { data: existing } = await supabase
        .from('course_clos')
        .select('id')
        .eq('course_id', cloData.course_id)
        .eq('clo_number', cloData.clo_number)
        .single()

      if (existing) {
        return { success: false, error: 'CLO number already exists for this course' }
      }

      const { data, error } = await supabase
        .from('course_clos')
        .insert({
          ...cloData,
          created_by: teacherId
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, clo: data }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create CLO'
      }
    }
  }

  /**
   * Update an existing CLO
   */
  static async updateCLO(cloId: string, updates: Partial<CreateCLOData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('course_clos')
        .update(updates)
        .eq('id', cloId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update CLO'
      }
    }
  }

  /**
   * Delete a CLO
   */
  static async deleteCLO(cloId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('course_clos')
        .delete()
        .eq('id', cloId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete CLO'
      }
    }
  }

  /**
   * Toggle CLO active status
   */
  static async toggleCLOStatus(cloId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('course_clos')
        .update({ is_active: isActive })
        .eq('id', cloId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to toggle CLO status'
      }
    }
  }

  /**
   * Get course overview with CLO statistics
   * Note: Mappings are done on-the-fly by AI, not stored in database
   */
  static async getCourseCLOOverview(courseId: string): Promise<{
    total_clos: number
    active_clos: number
  }> {
    try {
      const clos = await this.getCourseCLOs(courseId)
      
      return {
        total_clos: clos.length,
        active_clos: clos.filter(c => c.is_active).length
      }
    } catch (error) {
      console.error('Error fetching CLO overview:', error)
      return {
        total_clos: 0,
        active_clos: 0
      }
    }
  }
}

