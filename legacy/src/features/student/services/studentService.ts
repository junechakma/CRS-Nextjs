import { supabase } from '../../../lib/supabase'

export interface SessionAccessData {
  id: string
  course_code: string
  course_title: string
  section: string
  teacher_name: string
  room_number?: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: 'pending' | 'active' | 'completed' | 'expired' | 'cancelled'
  questions: Question[]
  settings: {
    allow_late_entry: boolean
    require_completion: boolean
    anonymous_responses: boolean
    show_results: boolean
  }
}

export interface Question {
  id: string
  text: string
  type: 'rating' | 'multiple_choice' | 'text' | 'yes_no'
  category: 'instructor' | 'content' | 'delivery' | 'assessment' | 'overall'
  scale?: number
  options?: string[]
  required: boolean
  priority?: number
}

export interface ResponseData {
  question_id: string
  response_value: string | number
  rating?: number
}

export interface SubmitResponseData {
  session_id: string
  student_anonymous_id: string
  response_data: Record<string, any>
  metadata: {
    ip_address?: string
    user_agent?: string
    browser_fingerprint?: string
    start_time: string
    completion_time_seconds: number
    device_type: string
  }
}

export class StudentService {
  static async getSessionByAnonymousKey(anonymousKey: string): Promise<{ success: boolean; session?: SessionAccessData; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('response_sessions')
        .select(`
          id,
          section,
          room_number,
          session_date,
          start_time,
          end_time,
          duration_minutes,
          status,
          questions,
          settings,
          courses!course_id (
            course_code,
            course_title,
            users!teacher_id (
              name
            )
          )
        `)
        .eq('anonymous_key', anonymousKey.toUpperCase())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Session not found. Please check your access key.' }
        }
        throw error
      }

      if (!data) {
        return { success: false, error: 'Session not found' }
      }

      // Check if session is accessible
      if (data.status === 'pending') {
        return { success: false, error: 'This session has not started yet. Please wait for your teacher to start the session.' }
      }

      if (data.status === 'completed') {
        return { success: false, error: 'This session has already ended.' }
      }

      if (data.status === 'expired' || data.status === 'cancelled') {
        return { success: false, error: 'This session is no longer available.' }
      }

      // For active sessions, check if late entry is allowed
      if (data.status === 'active' && !data.settings?.allow_late_entry) {
        const now = new Date()
        const endTime = new Date(data.end_time)
        if (now > endTime) {
          return { success: false, error: 'This session has ended and late entry is not allowed.' }
        }
      }

      const session: SessionAccessData = {
        id: data.id,
        course_code: (data.courses as any)?.course_code || '',
        course_title: (data.courses as any)?.course_title || '',
        section: data.section,
        teacher_name: (data.courses as any)?.users?.name || '',
        room_number: data.room_number,
        session_date: data.session_date,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes,
        status: data.status,
        questions: data.questions || [],
        settings: data.settings || {
          allow_late_entry: false,
          require_completion: true,
          anonymous_responses: true,
          show_results: false
        }
      }

      return { success: true, session }
    } catch (error: any) {
      console.error('Error fetching session:', error)
      return {
        success: false,
        error: error.message || 'Failed to access session'
      }
    }
  }

  static async checkExistingResponse(sessionId: string, studentAnonymousId: string): Promise<{ exists: boolean; response?: any; reason?: string }> {
    try {
      // Only check by anonymous ID - removed IP/fingerprint checks to allow multiple students from same network
      const { data: idData, error: idError } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId)
        .eq('student_anonymous_id', studentAnonymousId)
        .single()

      if (idError && idError.code !== 'PGRST116') {
        throw idError
      }

      if (idData) {
        return { exists: true, response: idData }
      }

      return { exists: false }
    } catch (error) {
      console.error('Error checking existing response:', error)
      return { exists: false }
    }
  }

  static async submitResponse(responseData: SubmitResponseData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get session details for additional data
      const { data: sessionData, error: sessionError } = await supabase
        .from('response_sessions')
        .select('university_id, faculty_id, department_id, course_id, teacher_id')
        .eq('id', responseData.session_id)
        .single()

      if (sessionError || !sessionData) {
        return { success: false, error: 'Session not found' }
      }

      // Check if response already exists (only by student ID, no IP/fingerprint check)
      const existingCheck = await this.checkExistingResponse(
        responseData.session_id,
        responseData.student_anonymous_id
      )

      if (existingCheck.exists) {
        return { success: false, error: 'You have already submitted a response for this session.' }
      }

      // Submit the response
      const { error } = await supabase
        .from('responses')
        .insert({
          session_id: responseData.session_id,
          university_id: sessionData.university_id,
          faculty_id: sessionData.faculty_id,
          department_id: sessionData.department_id,
          course_id: sessionData.course_id,
          teacher_id: sessionData.teacher_id,
          student_anonymous_id: responseData.student_anonymous_id,
          response_data: responseData.response_data,
          metadata: responseData.metadata,
          status: 'submitted'
        })

      if (error) throw error

      // Update session statistics
      await this.updateSessionStats(responseData.session_id)

      return { success: true }
    } catch (error: any) {
      console.error('Error submitting response:', error)
      return {
        success: false,
        error: error.message || 'Failed to submit response'
      }
    }
  }

  static async updateResponse(sessionId: string, studentAnonymousId: string, responseData: Record<string, any>, metadata: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('responses')
        .update({
          response_data: responseData,
          metadata: metadata,
          submission_time: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('student_anonymous_id', studentAnonymousId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error updating response:', error)
      return {
        success: false,
        error: error.message || 'Failed to update response'
      }
    }
  }

  private static async updateSessionStats(sessionId: string): Promise<void> {
    try {
      // Get current response count
      const { count } = await supabase
        .from('responses')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)

      // Update session stats
      await supabase
        .from('response_sessions')
        .update({
          stats: {
            total_responses: count || 0,
            target_responses: 0, // Could be updated based on course enrollment
            completion_rate: 100, // Assuming all submitted responses are complete
            average_time: 0 // Could be calculated from metadata
          }
        })
        .eq('id', sessionId)
    } catch (error) {
      console.error('Error updating session stats:', error)
    }
  }

  static generateAnonymousId(): string {
    // Generate a unique anonymous ID for the student
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `student_${timestamp}_${random}`
  }

  static getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|phone|tablet/.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  static async getClientIP(): Promise<string> {
    try {
      // Try multiple IP services for reliability
      const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ip.seeip.org/jsonip'
      ]

      for (const service of ipServices) {
        try {
          const response = await fetch(service)
          if (response.ok) {
            const data = await response.json()
            // Handle different response formats
            const ip = data.ip || data.query || data.IPv4 || data.ipAddress
            if (ip) return ip
          }
        } catch (error) {
          continue // Try next service
        }
      }

      // Fallback: try to get local IP from WebRTC
      return await this.getLocalIP()
    } catch (error) {
      console.error('Error getting client IP:', error)
      return 'unknown'
    }
  }

  private static getLocalIP(): Promise<string> {
    return new Promise((resolve) => {
      try {
        // WebRTC method to get local IP
        const rtc = new RTCPeerConnection({iceServers: []})
        rtc.createDataChannel('')
        
        rtc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
            if (ipMatch) {
              resolve(ipMatch[1])
              rtc.close()
            }
          }
        }
        
        rtc.createOffer().then((offer) => rtc.setLocalDescription(offer))
        
        // Timeout fallback
        setTimeout(() => resolve('local'), 3000)
      } catch (error) {
        resolve('unknown')
      }
    })
  }

  static generateBrowserFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Browser fingerprint', 2, 2)
      }

      const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        canvas: canvas.toDataURL(),
        webgl: this.getWebGLInfo(),
        plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
        hardwareConcurrency: navigator.hardwareConcurrency || 0
      }

      // Create a simple hash of the fingerprint
      const fingerprintString = JSON.stringify(fingerprint)
      let hash = 0
      for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }

      return `fp_${Math.abs(hash).toString(36)}`
    } catch (error) {
      console.error('Error generating browser fingerprint:', error)
      return `fp_${Date.now().toString(36)}`
    }
  }

  private static getWebGLInfo(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const vendor = gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL)
          const renderer = gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL)
          return `${vendor}_${renderer}`
        }
        return gl.getParameter(gl.VERSION) || 'unknown'
      }
      return 'no-webgl'
    } catch (error) {
      return 'webgl-error'
    }
  }
}