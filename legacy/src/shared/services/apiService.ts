import { supabase } from '../../lib/supabase'

export class ApiService {
  // Generic CRUD operations
  static async create<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async findById<T>(table: string, id: string, select = '*'): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as T | null
  }

  static async findMany<T>(
    table: string, 
    filters?: Record<string, any>, 
    select = '*',
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<T[]> {
    let query = supabase.from(table).select(select)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
    }

    const { data, error } = await query

    if (error) throw error
    return (data as T[]) || []
  }

  static async update<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Batch operations
  static async createMany<T>(table: string, data: Partial<T>[]): Promise<T[]> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()

    if (error) throw error
    return result
  }

  static async count(table: string, filters?: Record<string, any>): Promise<number> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    const { count, error } = await query

    if (error) throw error
    return count || 0
  }
}