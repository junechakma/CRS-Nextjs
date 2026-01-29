// Follow this guide for writing Deno edge functions: https://deno.land/manual@v1.32.5/introduction
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateTeacherRequest {
  name: string
  email: string
  initial: string
  phone: string
  department_id: string
  temp_password: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function called - create-teacher')

    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceRoleKey
    })

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)

    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a client with the user's token to verify they're a university admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verify the user is authenticated and is a university admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('User authentication:', { hasUser: !!user, error: userError?.message })

    if (userError || !user) {
      throw new Error(`Not authenticated: ${userError?.message || 'No user'}`)
    }

    // Get the user's role and university
    // Note: The users table has auth_user_id that links to Supabase Auth
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('id, role, university_id')
      .eq('auth_user_id', user.id)
      .single()

    console.log('User data:', { userData, error: userDataError?.message, auth_user_id: user.id })

    if (userDataError || !userData) {
      throw new Error(`User data not found: ${userDataError?.message || 'No data'}`)
    }

    if (userData.role !== 'university_admin') {
      throw new Error(`Only university admins can create teachers. Current role: ${userData.role}`)
    }

    if (!userData.university_id) {
      throw new Error('University admin not assigned to university')
    }

    // Get the request body
    const teacherData: CreateTeacherRequest = await req.json()
    console.log('Teacher data received:', { email: teacherData.email, name: teacherData.name })

    // Validate required fields
    if (!teacherData.email || !teacherData.name || !teacherData.department_id || !teacherData.temp_password) {
      throw new Error('Missing required fields: email, name, department_id, temp_password')
    }

    // Get department details to verify it belongs to the university and get faculty_id
    const { data: deptData, error: deptError } = await supabaseClient
      .from('departments')
      .select('faculty_id')
      .eq('id', teacherData.department_id)
      .eq('university_id', userData.university_id)
      .single()

    if (deptError || !deptData) {
      throw new Error('Department not found in this university')
    }

    // Check if teacher email already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', teacherData.email)
      .maybeSingle()

    if (existingUser) {
      throw new Error('Teacher email already exists')
    }

    // Check if initial already exists in this department
    const { data: existingInitial, error: existingInitialError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('department_id', teacherData.department_id)
      .eq('initial', teacherData.initial.toUpperCase())
      .eq('role', 'teacher')
      .maybeSingle()

    if (existingInitial) {
      throw new Error('Teacher initial already exists in this department')
    }

    // Create the auth user with email confirmation enabled
    // This will send a confirmation email to the teacher
    console.log('Creating auth user for:', teacherData.email)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: teacherData.email,
      password: teacherData.temp_password,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        name: teacherData.name,
        role: 'teacher',
      }
    })

    console.log('Auth user creation result:', {
      success: !!authData.user,
      userId: authData.user?.id,
      error: authError?.message
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user: no user returned')
    }

    // Create the teacher record in the database using the SECURITY DEFINER function
    const { data: teacherRecord, error: teacherRecordError } = await supabaseAdmin
      .rpc('create_teacher_record', {
        p_auth_user_id: authData.user.id,
        p_email: teacherData.email,
        p_name: teacherData.name,
        p_initial: teacherData.initial,
        p_phone: teacherData.phone || '',
        p_university_id: userData.university_id,
        p_faculty_id: deptData.faculty_id,
        p_department_id: teacherData.department_id,
        p_approved_by: userData.id  // Use the database user ID, not auth ID
      })

    if (teacherRecordError || !teacherRecord?.success) {
      // If database insert fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(teacherRecord?.error || teacherRecordError?.message || 'Failed to create teacher record')
    }

    return new Response(
      JSON.stringify({
        success: true,
        teacher_id: authData.user.id,
        message: 'Teacher created successfully. Confirmation email sent.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
