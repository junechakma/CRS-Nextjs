'use server'

import { createClient } from './server'
import { revalidatePath } from 'next/cache'

// ============================================================================
// USER ACTIONS (Super Admin)
// ============================================================================

export async function updateUser(
  userId: string,
  data: {
    plan?: 'free' | 'premium' | 'custom'
    status?: 'active' | 'inactive' | 'banned'
    name?: string
    institution?: string
    department?: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user:', error)
    return { success: false, error: error.message }
  }

  // If plan changed, update subscription too
  if (data.plan) {
    await supabase
      .from('subscriptions')
      .update({
        plan: data.plan,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_active', true)
  }

  // Log activity
  await logActivity({
    action: 'user_updated',
    entity_type: 'user',
    entity_id: userId,
    metadata: { changes: data },
  })

  revalidatePath('/super-admin/users')
  revalidatePath('/super-admin')

  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Note: This will cascade delete related data due to foreign key constraints
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: error.message }
  }

  // Log activity
  await logActivity({
    action: 'user_deleted',
    entity_type: 'user',
    entity_id: userId,
  })

  revalidatePath('/super-admin/users')
  revalidatePath('/super-admin')

  return { success: true }
}

export async function createUserByAdmin(data: {
  email: string
  name: string
  institution?: string
  department?: string
  plan: 'free' | 'premium' | 'custom'
}) {
  const supabase = await createClient()

  // Note: This creates a user profile without auth account
  // In production, you might want to send an invite email instead
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      id: crypto.randomUUID(), // Generate a UUID
      email: data.email,
      name: data.name,
      institution: data.institution || null,
      department: data.department || null,
      plan: data.plan,
      role: 'teacher',
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }

  // Create subscription
  if (newUser) {
    await supabase
      .from('subscriptions')
      .insert({
        user_id: newUser.id,
        plan: data.plan,
        courses_limit: data.plan === 'free' ? 5 : data.plan === 'premium' ? 20 : 100,
        sessions_limit: data.plan === 'free' ? 10 : data.plan === 'premium' ? 50 : 500,
        ai_analytics_limit: data.plan === 'free' ? 10 : data.plan === 'premium' ? 100 : 1000,
        clo_sets_limit: data.plan === 'free' ? 2 : data.plan === 'premium' ? 10 : 50,
        is_active: true,
      })

    // Log activity
    await logActivity({
      action: 'user_created_by_admin',
      entity_type: 'user',
      entity_id: newUser.id,
      metadata: { email: data.email, plan: data.plan },
    })
  }

  revalidatePath('/super-admin/users')
  revalidatePath('/super-admin')

  return { success: true, data: newUser }
}

// ============================================================================
// TEMPLATE ACTIONS (Teacher)
// ============================================================================

export async function createTemplate(
  userId: string,
  data: {
    name: string
    description?: string
    questions: {
      text: string
      type: 'rating' | 'text' | 'multiple' | 'boolean' | 'numeric'
      required: boolean
      scale?: number
      min_value?: number
      max_value?: number
      options?: string[]
      order_index: number
    }[]
  }
) {
  const supabase = await createClient()

  // Create template
  const { data: template, error: templateError } = await supabase
    .from('question_templates')
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      is_base: false,
      status: 'active',
      usage_count: 0,
    })
    .select()
    .single()

  if (templateError || !template) {
    console.error('Error creating template:', templateError)
    return { success: false, error: templateError?.message || 'Failed to create template' }
  }

  // Create questions
  const questionsToInsert = data.questions.map((q, index) => ({
    template_id: template.id,
    text: q.text,
    type: q.type,
    required: q.required,
    scale: q.scale || 5,
    min_value: q.min_value || 1,
    max_value: q.max_value || 10,
    options: q.options || null,
    order_index: q.order_index ?? index,
  }))

  const { error: questionsError } = await supabase
    .from('template_questions')
    .insert(questionsToInsert)

  if (questionsError) {
    console.error('Error creating questions:', questionsError)
    // Rollback template
    await supabase.from('question_templates').delete().eq('id', template.id)
    return { success: false, error: questionsError.message }
  }

  revalidatePath('/teacher/questions')

  return { success: true, data: template }
}

export async function updateTemplate(
  templateId: string,
  userId: string,
  data: {
    name?: string
    description?: string
    status?: 'active' | 'inactive'
    questions?: {
      id?: string
      text: string
      type: 'rating' | 'text' | 'multiple' | 'boolean' | 'numeric'
      required: boolean
      scale?: number
      min_value?: number
      max_value?: number
      options?: string[]
      order_index: number
    }[]
  }
) {
  const supabase = await createClient()

  // Verify ownership (non-base templates only)
  const { data: existingTemplate } = await supabase
    .from('question_templates')
    .select('user_id, is_base')
    .eq('id', templateId)
    .single()

  if (!existingTemplate || (existingTemplate.user_id !== userId && !existingTemplate.is_base)) {
    return { success: false, error: 'Unauthorized' }
  }

  // Base templates can only have status updated by super admin
  if (existingTemplate.is_base) {
    return { success: false, error: 'Cannot modify base template' }
  }

  // Update template
  const { error: updateError } = await supabase
    .from('question_templates')
    .update({
      name: data.name,
      description: data.description,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)

  if (updateError) {
    console.error('Error updating template:', updateError)
    return { success: false, error: updateError.message }
  }

  // Update questions if provided
  if (data.questions) {
    // Delete existing questions
    await supabase
      .from('template_questions')
      .delete()
      .eq('template_id', templateId)

    // Insert new questions
    const questionsToInsert = data.questions.map((q, index) => ({
      template_id: templateId,
      text: q.text,
      type: q.type,
      required: q.required,
      scale: q.scale || 5,
      min_value: q.min_value || 1,
      max_value: q.max_value || 10,
      options: q.options || null,
      order_index: q.order_index ?? index,
    }))

    await supabase
      .from('template_questions')
      .insert(questionsToInsert)
  }

  revalidatePath('/teacher/questions')

  return { success: true }
}

export async function deleteTemplate(templateId: string, userId: string) {
  const supabase = await createClient()

  // Verify ownership
  const { data: existingTemplate } = await supabase
    .from('question_templates')
    .select('user_id, is_base')
    .eq('id', templateId)
    .single()

  if (!existingTemplate || existingTemplate.user_id !== userId || existingTemplate.is_base) {
    return { success: false, error: 'Unauthorized or cannot delete base template' }
  }

  const { error } = await supabase
    .from('question_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    console.error('Error deleting template:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/teacher/questions')

  return { success: true }
}

export async function duplicateTemplate(templateId: string, userId: string) {
  const supabase = await createClient()

  // Get original template with questions
  const { data: original, error: fetchError } = await supabase
    .from('question_templates')
    .select(`
      *,
      template_questions(*)
    `)
    .eq('id', templateId)
    .single()

  if (fetchError || !original) {
    return { success: false, error: 'Template not found' }
  }

  // Create new template
  const { data: newTemplate, error: createError } = await supabase
    .from('question_templates')
    .insert({
      user_id: userId,
      name: `${original.name} (Copy)`,
      description: original.description,
      is_base: false,
      status: 'inactive',
      usage_count: 0,
    })
    .select()
    .single()

  if (createError || !newTemplate) {
    return { success: false, error: createError?.message || 'Failed to create template' }
  }

  // Copy questions
  if (original.template_questions?.length > 0) {
    const questionsToInsert = original.template_questions.map((q: Record<string, unknown>) => ({
      template_id: newTemplate.id,
      text: q.text,
      type: q.type,
      required: q.required,
      scale: q.scale,
      min_value: q.min_value,
      max_value: q.max_value,
      options: q.options,
      order_index: q.order_index,
    }))

    await supabase
      .from('template_questions')
      .insert(questionsToInsert)
  }

  revalidatePath('/teacher/questions')

  return { success: true, data: newTemplate }
}

export async function toggleTemplateStatus(templateId: string, userId: string) {
  const supabase = await createClient()

  // Get current status
  const { data: template } = await supabase
    .from('question_templates')
    .select('status, user_id, is_base')
    .eq('id', templateId)
    .single()

  if (!template || (template.user_id !== userId && !template.is_base)) {
    return { success: false, error: 'Unauthorized' }
  }

  if (template.is_base) {
    return { success: false, error: 'Cannot modify base template status' }
  }

  const newStatus = template.status === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('question_templates')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', templateId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/teacher/questions')

  return { success: true, newStatus }
}

// ============================================================================
// BASE TEMPLATE ACTIONS (Super Admin)
// ============================================================================

export async function updateBaseTemplate(data: {
  name?: string
  description?: string
  status?: 'active' | 'inactive'
  questions?: {
    text: string
    type: 'rating' | 'text' | 'multiple' | 'boolean' | 'numeric'
    required: boolean
    scale?: number
    min_value?: number
    max_value?: number
    options?: string[]
    order_index: number
  }[]
}) {
  const supabase = await createClient()

  // Get current user and verify super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { success: false, error: 'Only super admins can modify the base template' }
  }

  // Get base template
  const { data: baseTemplate } = await supabase
    .from('question_templates')
    .select('id')
    .eq('is_base', true)
    .single()

  if (!baseTemplate) {
    return { success: false, error: 'Base template not found' }
  }

  // Update template
  const { error: updateError } = await supabase
    .from('question_templates')
    .update({
      name: data.name,
      description: data.description,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', baseTemplate.id)

  if (updateError) {
    console.error('Error updating base template:', updateError)
    return { success: false, error: updateError.message }
  }

  // Update questions if provided
  if (data.questions) {
    // Delete existing questions
    await supabase
      .from('template_questions')
      .delete()
      .eq('template_id', baseTemplate.id)

    // Insert new questions
    const questionsToInsert = data.questions.map((q, index) => ({
      template_id: baseTemplate.id,
      text: q.text,
      type: q.type,
      required: q.required,
      scale: q.scale || 5,
      min_value: q.min_value || 1,
      max_value: q.max_value || 10,
      options: q.options || null,
      order_index: q.order_index ?? index,
    }))

    const { error: questionsError } = await supabase
      .from('template_questions')
      .insert(questionsToInsert)

    if (questionsError) {
      console.error('Error updating questions:', questionsError)
      return { success: false, error: questionsError.message }
    }
  }

  // Log activity
  await logActivity({
    action: 'base_template_updated',
    entity_type: 'question_template',
    entity_id: baseTemplate.id,
    metadata: { changes: data },
  })

  revalidatePath('/super-admin/question-bank')
  revalidatePath('/teacher/questions')

  return { success: true }
}

export async function toggleBaseTemplateStatus() {
  const supabase = await createClient()

  // Get current user and verify super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { success: false, error: 'Only super admins can modify the base template' }
  }

  // Get base template current status
  const { data: baseTemplate } = await supabase
    .from('question_templates')
    .select('id, status')
    .eq('is_base', true)
    .single()

  if (!baseTemplate) {
    return { success: false, error: 'Base template not found' }
  }

  const newStatus = baseTemplate.status === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('question_templates')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', baseTemplate.id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log activity
  await logActivity({
    action: 'base_template_status_toggled',
    entity_type: 'question_template',
    entity_id: baseTemplate.id,
    metadata: { newStatus },
  })

  revalidatePath('/super-admin/question-bank')
  revalidatePath('/teacher/questions')

  return { success: true, newStatus }
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

async function logActivity(data: {
  action: string
  entity_type?: string
  entity_id?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('activity_log')
    .insert({
      user_id: user?.id || null,
      action: data.action,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      metadata: data.metadata || null,
    })
}
