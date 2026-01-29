import { supabase } from '../../../lib/supabase'

export interface BackupData {
  sheet_name: string
  data: any[]
}

export interface BackupResult {
  success: boolean
  backupId?: string
  downloadUrl?: string
  fileName?: string
  error?: string
}

export class BackupService {
  /**
   * Create a system backup in the specified format
   */
  static async createBackup(format: 'excel' | 'sql', userId?: string): Promise<BackupResult> {
    try {
      let adminId = userId

      // If no userId provided, try to get from auth
      if (!adminId) {
        const { data: authUser } = await supabase.auth.getUser()
        if (!authUser.user) {
          throw new Error('User not authenticated')
        }
        adminId = authUser.user.id
      }

      if (format === 'excel') {
        // Generate Excel file client-side
        const excelBlob = await this.generateExcelBackup()
        const fileName = `backup_${new Date().toISOString().split('T')[0]}.xlsx`
        
        // Create download link
        const url = URL.createObjectURL(excelBlob)
        
        return {
          success: true,
          backupId: crypto.randomUUID(), // Generate a local ID for tracking
          downloadUrl: url,
          fileName
        }
      } else if (format === 'sql') {
        // Generate SQL dump
        const sqlContent = await this.generateSQLBackup()
        const fileName = `backup_${new Date().toISOString().split('T')[0]}.sql`
        
        // Create download link
        const blob = new Blob([sqlContent], { type: 'text/sql' })
        const url = URL.createObjectURL(blob)
        
        return {
          success: true,
          backupId: crypto.randomUUID(), // Generate a local ID for tracking
          downloadUrl: url,
          fileName
        }
      }

      throw new Error('Unsupported backup format')
    } catch (error) {
      console.error('Error creating backup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate Excel backup file
   */
  private static async generateExcelBackup(): Promise<Blob> {
    try {
      let csvContent = ''
      
      // Users Sheet
      csvContent += 'Sheet: Users\n'
      csvContent += '='.repeat(50) + '\n'
      
      const { data: users } = await supabase
        .from('users')
        .select(`
          id, email, role, name, initial, phone, status, 
          approval_status, created_at, universities(name)
        `)
        .limit(1000)

      if (users && users.length > 0) {
        csvContent += 'ID,Email,Role,Name,Initial,Phone,Status,Approval Status,Created At,University\n'
        
        for (const user of users) {
          const row = [
            user.id,
            user.email,
            user.role,
            user.name,
            user.initial || '',
            user.phone || '',
            user.status,
            user.approval_status,
            user.created_at,
            (user.universities as any)?.name || ''
          ].map(value => {
            const str = String(value || '')
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
          }).join(',')
          csvContent += row + '\n'
        }
      }
      csvContent += '\n\n'

      // Universities Sheet
      csvContent += 'Sheet: Universities\n'
      csvContent += '='.repeat(50) + '\n'
      
      const { data: universities } = await supabase
        .from('universities')
        .select('id, name, code, website, address, city, state, country, email, phone, status, created_at')
        .limit(1000)

      if (universities && universities.length > 0) {
        csvContent += 'ID,Name,Code,Website,Address,City,State,Country,Email,Phone,Status,Created At\n'
        
        for (const uni of universities) {
          const row = [
            uni.id,
            uni.name,
            uni.code,
            uni.website || '',
            uni.address || '',
            uni.city || '',
            uni.state || '',
            uni.country || '',
            uni.email || '',
            uni.phone || '',
            uni.status,
            uni.created_at
          ].map(value => {
            const str = String(value || '')
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
          }).join(',')
          csvContent += row + '\n'
        }
      }
      csvContent += '\n\n'

      // System Config Sheet
      csvContent += 'Sheet: System Configuration\n'
      csvContent += '='.repeat(50) + '\n'
      
      const { data: config } = await supabase
        .from('system_config')
        .select('key, value, description, created_at, updated_at')

      if (config && config.length > 0) {
        csvContent += 'Key,Value,Description,Created At,Updated At\n'
        
        for (const item of config) {
          const row = [
            item.key,
            JSON.stringify(item.value),
            item.description || '',
            item.created_at,
            item.updated_at
          ].map(value => {
            const str = String(value || '')
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
          }).join(',')
          csvContent += row + '\n'
        }
      }

      return new Blob([csvContent], { 
        type: 'text/csv'
      })
    } catch (error) {
      console.error('Error generating Excel backup:', error)
      throw new Error(`Failed to generate Excel backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate SQL dump backup
   */
  private static async generateSQLBackup(): Promise<string> {
    try {
      let sqlDump = ''
      
      // Add header
      sqlDump += '-- CRS Feedback System Database Backup\n'
      sqlDump += `-- Generated on: ${new Date().toISOString()}\n`
      sqlDump += '-- Database: CRS Feedback System\n'
      sqlDump += '\nBEGIN;\n\n'

      // System Config Data
      sqlDump += '-- System Configuration Data\n'
      const { data: config } = await supabase
        .from('system_config')
        .select('*')

      if (config && config.length > 0) {
        for (const item of config) {
          sqlDump += `INSERT INTO system_config (id, key, value, description, created_at, updated_at, updated_by) VALUES (\n`
          sqlDump += `  '${item.id}',\n`
          sqlDump += `  '${item.key}',\n`
          sqlDump += `  '${JSON.stringify(item.value).replace(/'/g, "''")}',\n`
          sqlDump += `  ${item.description ? `'${item.description.replace(/'/g, "''")}'` : 'NULL'},\n`
          sqlDump += `  '${item.created_at}',\n`
          sqlDump += `  '${item.updated_at}',\n`
          sqlDump += `  ${item.updated_by ? `'${item.updated_by}'` : 'NULL'}\n`
          sqlDump += `);\n\n`
        }
      }

      // Universities Data
      sqlDump += '-- Universities Data\n'
      const { data: universities } = await supabase
        .from('universities')
        .select('*')
        .limit(100)

      if (universities && universities.length > 0) {
        for (const uni of universities) {
          sqlDump += `INSERT INTO universities (id, name, code, address, city, state, country, email, phone, website, status, created_at, updated_at) VALUES (\n`
          sqlDump += `  '${uni.id}',\n`
          sqlDump += `  '${uni.name.replace(/'/g, "''")}',\n`
          sqlDump += `  '${uni.code}',\n`
          sqlDump += `  ${uni.address ? `'${uni.address.replace(/'/g, "''")}'` : 'NULL'},\n`
          sqlDump += `  ${uni.city ? `'${uni.city.replace(/'/g, "''")}'` : 'NULL'},\n`
          sqlDump += `  ${uni.state ? `'${uni.state.replace(/'/g, "''")}'` : 'NULL'},\n`
          sqlDump += `  ${uni.country ? `'${uni.country.replace(/'/g, "''")}'` : 'NULL'},\n`
          sqlDump += `  ${uni.email ? `'${uni.email}'` : 'NULL'},\n`
          sqlDump += `  ${uni.phone ? `'${uni.phone}'` : 'NULL'},\n`
          sqlDump += `  ${uni.website ? `'${uni.website}'` : 'NULL'},\n`
          sqlDump += `  '${uni.status}',\n`
          sqlDump += `  '${uni.created_at}',\n`
          sqlDump += `  '${uni.updated_at}'\n`
          sqlDump += `);\n\n`
        }
      }

      // Add commit and footer
      sqlDump += 'COMMIT;\n'
      sqlDump += '\n-- Backup completed successfully\n'

      return sqlDump
    } catch (error) {
      console.error('Error generating SQL backup:', error)
      throw new Error(`Failed to generate SQL backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get backup history
   */
  static async getBackupHistory(limit: number = 10) {
    try {
      const { data, error } = await supabase.rpc('get_backup_history', {
        limit_count: limit
      })

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      console.error('Error fetching backup history:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Validate backup
   */
  static async validateBackup(backupId: string) {
    try {
      const { data, error } = await supabase.rpc('validate_backup', {
        backup_id: backupId
      })

      if (error) throw error

      const result = data[0]
      return {
        success: true,
        isValid: result?.is_valid || false,
        message: result?.validation_message || 'Unknown status'
      }
    } catch (error) {
      console.error('Error validating backup:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Clean up old backups
   */
  static async cleanupOldBackups(daysOld: number = 30) {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_backups', {
        days_old: daysOld
      })

      if (error) throw error

      return {
        success: true,
        deletedCount: data || 0
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}