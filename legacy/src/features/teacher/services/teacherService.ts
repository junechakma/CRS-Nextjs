import { supabase } from '../../../lib/supabase'

export interface TeacherDashboardStats {
  totalCourses: number
  totalSessions: number
  totalResponses: number
  activeSessions: number
  averageRating: number
  currentSemester?: string
}

export interface Course {
  id: string
  course_code: string
  course_title: string
  credit_hours: number
  sections: string[]
  semester_id: string
  semester_name: string
  academic_year: string
  department_name: string
  faculty_name: string
  university_name: string
  status: 'active' | 'inactive' | 'completed' | 'cancelled'
  settings: {
    allow_responses: boolean
    response_deadline?: string
    require_attendance: boolean
    min_response_count: number
  }
  created_at: string
  updated_at: string
}

export interface ResponseSession {
  id: string
  course_id: string
  course_code: string
  course_title: string
  section: string
  room_number?: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  anonymous_key: string
  status: 'pending' | 'active' | 'completed' | 'expired' | 'cancelled'
  questions: Question[]
  settings: {
    allow_late_entry: boolean
    require_completion: boolean
    anonymous_responses: boolean
    show_results: boolean
  }
  stats: {
    total_responses: number
    target_responses: number
    completion_rate: number
    average_time: number
  }
  created_at: string
  updated_at: string
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

export interface Semester {
  id: string
  name: 'Spring' | 'Summer' | 'Autumn' | 'Year'
  academic_year: string
  status: 'active' | 'inactive' | 'completed'
  start_date: string
  end_date: string
  is_current: boolean
}

export interface CreateCourseData {
  course_code: string
  course_title: string
  credit_hours: number
  sections: string[]
  semester_id: string
}

export interface CreateSessionData {
  course_id: string
  section: string
  room_number?: string
  session_date: string
  duration_minutes: number
  questions: string[] // Question IDs
}

export interface ResponseData {
  session_id: string
  question_id: string
  response_value: string
  rating?: number
}

export interface SessionResponse {
  id: string
  session_id: string
  student_anonymous_id: string
  response_data: Record<string, any>
  metadata: {
    ip_address?: string
    user_agent?: string
    start_time?: string
    completion_time_seconds: number
    device_type: string
  }
  status: 'draft' | 'submitted' | 'validated' | 'flagged'
  submission_time: string
  created_at: string
}

export class TeacherService {
  static async getDashboardStats(teacherId: string): Promise<TeacherDashboardStats> {
    try {
      // First get teacher's university_id
      const { data: teacherData } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', teacherId)
        .single()

      const [
        coursesResult,
        sessionsResult,
        responsesResult,
        activeSessionsResult
      ] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }).eq('teacher_id', teacherId).eq('status', 'active'),
        supabase.from('response_sessions').select('id', { count: 'exact' }).eq('teacher_id', teacherId),
        supabase.from('responses').select('id', { count: 'exact' }).eq('teacher_id', teacherId),
        supabase.from('response_sessions').select('id', { count: 'exact' }).eq('teacher_id', teacherId).eq('status', 'active')
      ])

      // Get current semester for the teacher's university
      const { data: currentSemesterData, error: semesterError } = await supabase
        .from('semesters')
        .select('name, academic_year')
        .eq('university_id', teacherData?.university_id)
        .eq('is_current', true)
        .maybeSingle() // Use maybeSingle() instead of single() to avoid errors when no current semester
      
      if (semesterError) {
        console.warn('Error fetching current semester:', semesterError)
      }

      // Calculate average rating from responses
      const { data: ratingData } = await supabase
        .from('responses')
        .select('response_data')
        .eq('teacher_id', teacherId)

      let averageRating = 0
      if (ratingData && ratingData.length > 0) {
        const ratings = ratingData
          .map(r => r.response_data)
          .filter(data => data && typeof data === 'object')
          .flatMap(data => Object.values(data))
          .filter(value => typeof value === 'number' && value >= 1 && value <= 5)
        
        if (ratings.length > 0) {
          averageRating = (ratings as number[]).reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
        }
      }

      return {
        totalCourses: coursesResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        totalResponses: responsesResult.count || 0,
        activeSessions: activeSessionsResult.count || 0,
        averageRating: Math.round(averageRating * 100) / 100,
        currentSemester: currentSemesterData ? `${currentSemesterData.name} ${currentSemesterData.academic_year}` : undefined
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalCourses: 0,
        totalSessions: 0,
        totalResponses: 0,
        activeSessions: 0,
        averageRating: 0
      }
    }
  }

  static async getCourses(teacherId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        course_code,
        course_title,
        credit_hours,
        sections,
        status,
        settings,
        created_at,
        updated_at,
        semesters!semester_id (
          id,
          name,
          academic_year
        ),
        departments!department_id (
          name,
          faculties!faculty_id (
            name,
            universities!university_id (
              name
            )
          )
        )
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(course => {
      // Parse sections from JSONB string if needed
      let sections: string[] = []
      try {
        if (typeof course.sections === 'string') {
          sections = JSON.parse(course.sections)
        } else if (Array.isArray(course.sections)) {
          sections = course.sections
        }
      } catch (error) {
        console.error('Error parsing sections for course:', course.course_code, error)
        sections = []
      }

      return {
        ...course,
        sections,
        semester_id: (course.semesters as any)?.id || '',
        semester_name: (course.semesters as any)?.name || '',
        academic_year: (course.semesters as any)?.academic_year || '',
        department_name: (course.departments as any)?.name || '',
        faculty_name: (course.departments as any)?.faculties?.name || '',
        university_name: (course.departments as any)?.faculties?.universities?.name || '',
        semesters: undefined,
        departments: undefined
      }
    }) || []
  }

  static async getSemesters(universityId: string): Promise<Semester[]> {
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .eq('university_id', universityId)
      .order('academic_year', { ascending: false })
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createCourse(teacherId: string, courseData: CreateCourseData): Promise<{ success: boolean; error?: string; course_id?: string }> {
    try {
      // Get teacher's university, faculty, and department info
      const { data: teacherData, error: teacherError } = await supabase
        .from('users')
        .select('university_id, faculty_id, department_id')
        .eq('id', teacherId)
        .eq('role', 'teacher')
        .single()

      if (teacherError || !teacherData) {
        return { success: false, error: 'Teacher not found' }
      }

      // Check if course code already exists for this teacher in this semester
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('course_code', courseData.course_code.toUpperCase())
        .eq('semester_id', courseData.semester_id)
        .single()

      if (existingCourse) {
        return { success: false, error: 'Course code already exists for this semester' }
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          university_id: teacherData.university_id,
          faculty_id: teacherData.faculty_id,
          department_id: teacherData.department_id,
          teacher_id: teacherId,
          semester_id: courseData.semester_id,
          course_code: courseData.course_code.toUpperCase(),
          course_title: courseData.course_title,
          credit_hours: courseData.credit_hours,
          sections: courseData.sections,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        course_id: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create course'
      }
    }
  }

  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update course'
      }
    }
  }

  static async deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete course'
      }
    }
  }

  static async getResponseSessions(teacherId: string): Promise<ResponseSession[]> {
    const { data, error } = await supabase
      .from('response_sessions')
      .select(`
        id,
        course_id,
        section,
        room_number,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        anonymous_key,
        status,
        questions,
        settings,
        stats,
        created_at,
        updated_at,
        courses!course_id (
          course_code,
          course_title
        )
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(session => ({
      ...session,
      course_code: (session.courses as any)?.course_code || '',
      course_title: (session.courses as any)?.course_title || '',
      courses: undefined
    })) || []
  }

  static async getResponseSession(sessionId: string): Promise<ResponseSession | null> {
    const { data, error } = await supabase
      .from('response_sessions')
      .select(`
        id,
        course_id,
        section,
        room_number,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        anonymous_key,
        status,
        questions,
        settings,
        stats,
        created_at,
        updated_at,
        courses!course_id (
          course_code,
          course_title
        )
      `)
      .eq('id', sessionId)
      .single()

    if (error) throw error

    if (!data) return null

    return {
      ...data,
      course_code: (data.courses as any)?.course_code || '',
      course_title: (data.courses as any)?.course_title || ''
    }
  }

  static async createResponseSession(teacherId: string, sessionData: CreateSessionData): Promise<{ success: boolean; error?: string; session_id?: string; anonymous_key?: string }> {
    try {
      // Get course details to ensure teacher owns the course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('university_id, faculty_id, department_id, semester_id')
        .eq('id', sessionData.course_id)
        .eq('teacher_id', teacherId)
        .single()

      if (courseError || !courseData) {
        return { success: false, error: 'Course not found or you do not have permission' }
      }

      // Get selected questions from templates if provided
      let selectedQuestions: any[] = []
      if (sessionData.questions && sessionData.questions.length > 0) {
        const allQuestions = await this.getQuestions(courseData.university_id)
        selectedQuestions = allQuestions.filter(q => sessionData.questions.includes(q.id))
      }

      // Generate anonymous key
      const generateAnonymousKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
      }

      // Sessions are created in 'pending' status with placeholder times
      // Actual times will be set when teacher clicks "Start Session"
      // Using session date + duration as placeholders to satisfy NOT NULL constraints
      const sessionDate = new Date(sessionData.session_date)
      const placeholderStartTime = sessionDate // Placeholder: session date at midnight
      const placeholderEndTime = new Date(sessionDate.getTime() + sessionData.duration_minutes * 60000)

      const { data, error } = await supabase
        .from('response_sessions')
        .insert({
          university_id: courseData.university_id,
          faculty_id: courseData.faculty_id,
          department_id: courseData.department_id,
          course_id: sessionData.course_id,
          teacher_id: teacherId,
          semester_id: courseData.semester_id,
          section: sessionData.section,
          room_number: sessionData.room_number,
          session_date: sessionData.session_date,
          start_time: placeholderStartTime.toISOString(),
          end_time: placeholderEndTime.toISOString(),
          duration_minutes: sessionData.duration_minutes,
          anonymous_key: generateAnonymousKey(),
          questions: selectedQuestions,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        session_id: data.id,
        anonymous_key: data.anonymous_key
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create response session'
      }
    }
  }

  static async updateSessionStatus(sessionId: string, status: ResponseSession['status']): Promise<{ success: boolean; error?: string }> {
    try {
      let updateData: any = { status }

      // When starting a session, set the actual start and end times in Asia/Dhaka timezone
      if (status === 'active') {
        // Get current time in Asia/Dhaka timezone
        const now = new Date()
        const dhakaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Dhaka"}))
        
        // Get the session's duration
        const { data: sessionData } = await supabase
          .from('response_sessions')
          .select('duration_minutes')
          .eq('id', sessionId)
          .single()

        if (sessionData) {
          const startTime = dhakaTime
          const endTime = new Date(startTime.getTime() + sessionData.duration_minutes * 60000)
          
          updateData.start_time = startTime.toISOString()
          updateData.end_time = endTime.toISOString()
        }
      }

      const { error } = await supabase
        .from('response_sessions')
        .update(updateData)
        .eq('id', sessionId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update session status'
      }
    }
  }

  static async getSessionResponses(sessionId: string): Promise<SessionResponse[]> {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('submission_time', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getQuestions(universityId: string): Promise<Question[]> {
    try {
      // Get activation status for default templates
      const { data: activations, error: activationError } = await supabase
        .from('university_template_activations')
        .select('template_id, is_active')
        .eq('university_id', universityId)

      if (activationError) {
        console.error('Error fetching activations:', activationError)
      }

      const activationMap = new Map(
        (activations || []).map(a => [a.template_id, a.is_active])
      )

      // Get all templates (both university-specific and default)
      const { data: templates, error: templatesError } = await supabase
        .from('question_templates')
        .select('id, university_id, is_default, is_active')
        .or(`university_id.eq.${universityId},and(university_id.is.null,is_default.eq.true)`)

      if (templatesError) throw templatesError

      // Separate university-specific and default templates
      const universityTemplates = (templates || []).filter(t => t.university_id === universityId && t.is_active)
      const defaultTemplates = (templates || []).filter(t => t.is_default && t.university_id === null)

      // Filter active default templates based on activation map
      const activeDefaultTemplates = defaultTemplates.filter(t => {
        return activationMap.has(t.id) ? activationMap.get(t.id) : true
      })

      let activeTemplateIds: string[] = []

      // Priority logic:
      // 1. If university has active custom templates, use ONLY those
      // 2. Otherwise, use active default templates
      if (universityTemplates.length > 0) {
        activeTemplateIds = universityTemplates.map(t => t.id)
        console.log(`Using ${activeTemplateIds.length} custom university templates (ignoring defaults)`)
      } else if (activeDefaultTemplates.length > 0) {
        activeTemplateIds = activeDefaultTemplates.map(t => t.id)
        console.log(`Using ${activeTemplateIds.length} default templates (no custom templates found)`)
      } else {
        console.log('No active templates found for university:', universityId)
        console.log('University templates:', universityTemplates.length)
        console.log('Active default templates:', activeDefaultTemplates.length)
        return []
      }

      // Get questions from active templates
      const { data, error } = await supabase
        .from('template_questions')
        .select(`
          question_id,
          order_index,
          is_required,
          template_id,
          questions!inner(
            id,
            text,
            type,
            category,
            scale,
            options,
            required,
            priority
          )
        `)
        .in('template_id', activeTemplateIds)
        .eq('questions.is_active', true)
        .order('order_index', { ascending: true })

      if (error) throw error

      // If custom templates exist but have no questions, fallback to default templates
      if ((!data || data.length === 0) && universityTemplates.length > 0 && activeDefaultTemplates.length > 0) {
        console.log('Custom templates have no questions. Falling back to default templates...')
        console.log('Active default templates:', activeDefaultTemplates)

        // Retry with default templates
        const defaultTemplateIds = activeDefaultTemplates.map(t => t.id)
        console.log('Fetching questions for default template IDs:', defaultTemplateIds)

        const { data: defaultData, error: defaultError } = await supabase
          .from('template_questions')
          .select(`
            question_id,
            order_index,
            is_required,
            template_id,
            questions!inner(
              id,
              text,
              type,
              category,
              scale,
              options,
              required,
              priority
            )
          `)
          .in('template_id', defaultTemplateIds)
          .eq('questions.is_active', true)
          .order('order_index', { ascending: true })

        console.log('Default template questions query result:', {
          data: defaultData?.length || 0,
          error: defaultError
        })

        if (defaultError) {
          console.error('Error fetching default template questions:', defaultError)
          throw defaultError
        }

        if (!defaultData || defaultData.length === 0) {
          console.log('No questions found in default templates either')
          console.log('Checking if questions exist in questions table...')

          // Debug: Check questions table directly
          const { data: questionsCheck } = await supabase
            .from('questions')
            .select('id, text, is_default, university_id, is_active')
            .is('university_id', null)
            .eq('is_default', true)
            .eq('is_active', true)

          console.log('Default questions in questions table:', questionsCheck?.length || 0, questionsCheck)

          // Debug: Check template_questions table
          const { data: templateQuestionsCheck } = await supabase
            .from('template_questions')
            .select('template_id, question_id')
            .in('template_id', defaultTemplateIds)

          console.log('template_questions for default templates:', templateQuestionsCheck?.length || 0, templateQuestionsCheck)

          return []
        }

        console.log(`Loaded ${defaultData.length} questions from default templates`)

        // Use default template data
        const questionMap = new Map<string, Question>()

        defaultData.forEach((item: any) => {
          const question = item.questions
          if (!questionMap.has(question.id)) {
            questionMap.set(question.id, {
              id: question.id,
              text: question.text,
              type: question.type as 'rating' | 'multiple_choice' | 'text' | 'yes_no',
              category: question.category as 'instructor' | 'content' | 'delivery' | 'assessment' | 'overall',
              scale: question.scale,
              options: question.options || [],
              required: item.is_required !== null ? item.is_required : question.required,
              priority: item.order_index || question.priority || 0
            })
          }
        })

        return Array.from(questionMap.values()).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      }

      if (!data || data.length === 0) {
        console.log('No questions found in active templates')
        return []
      }

      // Convert to Question format, avoiding duplicates
      const questionMap = new Map<string, Question>()

      data.forEach((item: any) => {
        const question = item.questions
        if (!questionMap.has(question.id)) {
          questionMap.set(question.id, {
            id: question.id,
            text: question.text,
            type: question.type as 'rating' | 'multiple_choice' | 'text' | 'yes_no',
            category: question.category as 'instructor' | 'content' | 'delivery' | 'assessment' | 'overall',
            scale: question.scale,
            options: question.options || [],
            required: item.is_required !== null ? item.is_required : question.required,
            priority: item.order_index || question.priority || 0
          })
        }
      })

      return Array.from(questionMap.values()).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    } catch (error) {
      console.error('Error fetching questions:', error)
      return []
    }
  }

  static async getSessionAnalytics(sessionId: string): Promise<{
    totalResponses: number
    averageRating: number
    categoryRatings: Record<string, number>
    responseDistribution: Record<string, number>
    completionRate: number
  }> {
    try {
      const { data: responses, error } = await supabase
        .from('responses')
        .select('response_data, metadata')
        .eq('session_id', sessionId)

      if (error) throw error

      const totalResponses = responses?.length || 0
      
      if (totalResponses === 0) {
        return {
          totalResponses: 0,
          averageRating: 0,
          categoryRatings: {},
          responseDistribution: {},
          completionRate: 0
        }
      }

      // Calculate analytics from response data
      const allRatings: number[] = []
      const categoryRatings: Record<string, number[]> = {}
      const responseDistribution: Record<string, number> = {}

      responses?.forEach(response => {
        if (response.response_data && typeof response.response_data === 'object') {
          Object.entries(response.response_data).forEach(([_, value]) => {
            if (typeof value === 'number' && value >= 1 && value <= 5) {
              allRatings.push(value)
              
              // Group by category (would need question data to determine category)
              const category = 'overall' // Default category
              if (!categoryRatings[category]) categoryRatings[category] = []
              categoryRatings[category].push(value)
              
              // Distribution
              const key = `${value} stars`
              responseDistribution[key] = (responseDistribution[key] || 0) + 1
            }
          })
        }
      })

      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
        : 0

      const avgCategoryRatings: Record<string, number> = {}
      Object.entries(categoryRatings).forEach(([category, ratings]) => {
        avgCategoryRatings[category] = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      })

      return {
        totalResponses,
        averageRating: Math.round(averageRating * 100) / 100,
        categoryRatings: avgCategoryRatings,
        responseDistribution,
        completionRate: 100 // Assuming all submitted responses are complete
      }
    } catch (error) {
      console.error('Error fetching session analytics:', error)
      return {
        totalResponses: 0,
        averageRating: 0,
        categoryRatings: {},
        responseDistribution: {},
        completionRate: 0
      }
    }
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('change_password', {
        p_user_id: userId,
        p_old_password: oldPassword,
        p_new_password: newPassword
      })

      if (error) throw error

      if (data && !data.success) {
        return { success: false, error: data.error }
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to change password'
      }
    }
  }

  static async getTeacherProfile(teacherId: string): Promise<{
    id: string
    name: string
    email: string
    phone?: string
    initial?: string
    department_name: string
    faculty_name: string
    university_name: string
    last_login?: string
    password_change_required: boolean
  } | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          initial,
          last_login,
          password_change_required,
          departments!department_id (
            name,
            faculties!faculty_id (
              name,
              universities!university_id (
                name
              )
            )
          )
        `)
        .eq('id', teacherId)
        .eq('role', 'teacher')
        .single()

      if (error) throw error

      return {
        ...data,
        department_name: (data.departments as any)?.name || '',
        faculty_name: (data.departments as any)?.faculties?.name || '',
        university_name: (data.departments as any)?.faculties?.universities?.name || ''
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error)
      return null
    }
  }

  static async getCoursesSessions(courseId: string): Promise<ResponseSession[]> {
    const { data, error } = await supabase
      .from('response_sessions')
      .select(`
        id,
        course_id,
        section,
        room_number,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        anonymous_key,
        status,
        questions,
        settings,
        stats,
        created_at,
        updated_at,
        courses!course_id (
          course_code,
          course_title
        )
      `)
      .eq('course_id', courseId)
      .order('session_date', { ascending: false })

    if (error) throw error

    return data?.map(session => ({
      ...session,
      course_code: (session.courses as any)?.course_code || '',
      course_title: (session.courses as any)?.course_title || '',
      courses: undefined,
      questions: session.questions || []
    })) || []
  }

  static async getDurations(universityId: string): Promise<{ id: string; minutes: number; label: string }[]> {
    try {
      const { data, error } = await supabase
        .from('durations')
        .select('id, minutes, label')
        .eq('university_id', universityId)
        .order('minutes', { ascending: true })

      if (error) throw error

      return data?.map(duration => ({
        id: duration.id,
        minutes: duration.minutes,
        label: duration.label
      })) || []
    } catch (error) {
      console.error('Error fetching durations:', error)
      return []
    }
  }

  static async updateResponseSession(sessionId: string, data: CreateSessionData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('response_sessions')
        .update({
          course_id: data.course_id,
          section: data.section,
          room_number: data.room_number,
          session_date: data.session_date,
          duration_minutes: data.duration_minutes,
          questions: data.questions,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('status', 'pending') // Only allow updating pending sessions

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update session'
      }
    }
  }

  static async deleteResponseSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('response_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('status', 'pending') // Only allow deleting pending sessions

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete session'
      }
    }
  }
}