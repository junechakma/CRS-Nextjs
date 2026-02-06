"use server"

import { revalidatePath } from "next/cache"
import { getTeacherCLOSetsPaginated } from "@/lib/supabase/queries/teacher"
import { createClient } from "@/lib/supabase/server"

export interface CreateCLOSetInput {
  courseId: string
  name: string
  description?: string
  color?: string
}

export interface UpdateCLOSetInput {
  id: string
  name?: string
  description?: string
  color?: string
  status?: "active" | "draft"
}

export async function getCLOSetsPaginatedAction({
  page = 1,
  pageSize = 12,
  search = "",
  courseId = "",
}: {
  page?: number
  pageSize?: number
  search?: string
  courseId?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await getTeacherCLOSetsPaginated({
      userId: user.id,
      page,
      pageSize,
      search,
      courseId,
    })

    return {
      success: true,
      data: result.data,
      count: result.count,
      totalPages: result.totalPages,
    }
  } catch (error) {
    console.error("Error fetching paginated CLO sets:", error)
    return { success: false, error: "Failed to fetch CLO sets" }
  }
}

export async function createCLOSetAction(input: CreateCLOSetInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: cloSet, error } = await supabase
      .from("clo_sets")
      .insert({
        user_id: user.id,
        course_id: input.courseId,
        name: input.name,
        description: input.description || null,
        color: input.color || "indigo",
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating CLO set:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/clo-mapping")
    return { success: true, data: cloSet }
  } catch (error) {
    console.error("Error creating CLO set:", error)
    return { success: false, error: "Failed to create CLO set" }
  }
}

export async function updateCLOSetAction(input: UpdateCLOSetInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const updateData: Record<string, any> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description || null
    if (input.color !== undefined) updateData.color = input.color
    if (input.status !== undefined) updateData.status = input.status

    const { data, error } = await supabase
      .from("clo_sets")
      .update(updateData)
      .eq("id", input.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating CLO set:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/clo-mapping")
    revalidatePath(`/teacher/clo-mapping/${input.id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error updating CLO set:", error)
    return { success: false, error: "Failed to update CLO set" }
  }
}

export async function deleteCLOSetAction(cloSetId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase
      .from("clo_sets")
      .delete()
      .eq("id", cloSetId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting CLO set:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/clo-mapping")
    return { success: true }
  } catch (error) {
    console.error("Error deleting CLO set:", error)
    return { success: false, error: "Failed to delete CLO set" }
  }
}

// ============================================================================
// CLO ACTIONS (Individual CLOs within a set)
// ============================================================================

export interface CreateCLOInput {
  cloSetId: string
  code: string
  description: string
  bloomLevel?: string
  orderIndex?: number
}

export interface UpdateCLOInput {
  id: string
  code?: string
  description?: string
  bloomLevel?: string
}

export async function createCLOAction(input: CreateCLOInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify the CLO set belongs to the user
    const { data: cloSet } = await supabase
      .from("clo_sets")
      .select("id")
      .eq("id", input.cloSetId)
      .eq("user_id", user.id)
      .single()

    if (!cloSet) {
      return { success: false, error: "CLO set not found" }
    }

    // Get the next order index if not provided
    let orderIndex = input.orderIndex
    if (orderIndex === undefined) {
      const { data: maxOrderCLO } = await supabase
        .from("clos")
        .select("order_index")
        .eq("clo_set_id", input.cloSetId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single()

      orderIndex = (maxOrderCLO?.order_index || 0) + 1
    }

    const { data: clo, error } = await supabase
      .from("clos")
      .insert({
        clo_set_id: input.cloSetId,
        code: input.code,
        description: input.description,
        bloom_level: input.bloomLevel || null,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating CLO:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/teacher/clo-mapping/${input.cloSetId}`)
    return { success: true, data: clo }
  } catch (error) {
    console.error("Error creating CLO:", error)
    return { success: false, error: "Failed to create CLO" }
  }
}

export async function updateCLOAction(input: UpdateCLOInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify the CLO belongs to a set owned by the user
    const { data: clo } = await supabase
      .from("clos")
      .select("clo_set_id, clo_sets!inner(user_id)")
      .eq("id", input.id)
      .single()

    if (!clo || (clo.clo_sets as any).user_id !== user.id) {
      return { success: false, error: "CLO not found" }
    }

    const updateData: Record<string, any> = {}
    if (input.code !== undefined) updateData.code = input.code
    if (input.description !== undefined) updateData.description = input.description
    if (input.bloomLevel !== undefined) updateData.bloom_level = input.bloomLevel || null

    const { data: updatedCLO, error } = await supabase
      .from("clos")
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating CLO:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/teacher/clo-mapping/${clo.clo_set_id}`)
    return { success: true, data: updatedCLO }
  } catch (error) {
    console.error("Error updating CLO:", error)
    return { success: false, error: "Failed to update CLO" }
  }
}

export async function deleteCLOAction(cloId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get CLO to verify ownership and get clo_set_id
    const { data: clo } = await supabase
      .from("clos")
      .select("clo_set_id, clo_sets!inner(user_id)")
      .eq("id", cloId)
      .single()

    if (!clo || (clo.clo_sets as any).user_id !== user.id) {
      return { success: false, error: "CLO not found" }
    }

    const { error } = await supabase.from("clos").delete().eq("id", cloId)

    if (error) {
      console.error("Error deleting CLO:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/teacher/clo-mapping/${clo.clo_set_id}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting CLO:", error)
    return { success: false, error: "Failed to delete CLO" }
  }
}

export async function reorderCLOsAction(cloSetId: string, cloIds: string[]) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify the CLO set belongs to the user
    const { data: cloSet } = await supabase
      .from("clo_sets")
      .select("id")
      .eq("id", cloSetId)
      .eq("user_id", user.id)
      .single()

    if (!cloSet) {
      return { success: false, error: "CLO set not found" }
    }

    // Update order_index for each CLO
    const updates = cloIds.map((cloId, index) =>
      supabase
        .from("clos")
        .update({ order_index: index })
        .eq("id", cloId)
        .eq("clo_set_id", cloSetId)
    )

    await Promise.all(updates)

    revalidatePath(`/teacher/clo-mapping/${cloSetId}`)
    return { success: true }
  } catch (error) {
    console.error("Error reordering CLOs:", error)
    return { success: false, error: "Failed to reorder CLOs" }
  }
}
