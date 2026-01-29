import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Download, Database, AlertCircle, CheckCircle, Loader, FileText, FileSpreadsheet, Users, GraduationCap, BookOpen, MessageSquare, Shield } from 'lucide-react';
import { UniversityBackupService } from '../services/universityBackupService';
import type { BackupOptions, ExportFormat, BackupStats } from '../services/universityBackupService';
import type { RootState } from '../../../store/store';

interface BackupManagerProps {
  universityId: string;
}

export function BackupManagerComponent({ universityId }: BackupManagerProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeUsers: true,
    includeCourses: true,
    includeFeedback: true,
    includeSessions: true,
    universityId
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [lastBackupStats, setLastBackupStats] = useState<BackupStats | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Security check: Ensure user is university admin and belongs to this university
  useEffect(() => {
    if (!user) {
      setAccessDenied(true);
      setMessage({
        type: 'error',
        text: 'Authentication required to access backup functionality.'
      });
      return;
    }

    if (user.role !== 'university_admin') {
      setAccessDenied(true);
      setMessage({
        type: 'error',
        text: 'Only university administrators can create backups.'
      });
      return;
    }

    if (user.university_id !== universityId) {
      setAccessDenied(true);
      setMessage({
        type: 'error',
        text: 'Access denied: You can only backup data for your own university.'
      });
      return;
    }

    setAccessDenied(false);
  }, [user, universityId]);

  const handleCreateBackup = async () => {
    // Additional security check before backup
    if (accessDenied || !user || user.role !== 'university_admin' || user.university_id !== universityId) {
      setMessage({
        type: 'error',
        text: 'Access denied: Unauthorized backup attempt.'
      });
      return;
    }

    if (!universityId) {
      setMessage({
        type: 'error',
        text: 'University ID is required for backup operation.'
      });
      return;
    }

    setIsCreatingBackup(true);
    setMessage(null);

    try {
      // Ensure university ID is set in options
      const backupOptionsWithId = {
        ...backupOptions,
        universityId
      };
      
      setMessage({
        type: 'info',
        text: 'Creating backup... This may take a few moments.'
      });

      const backup = await UniversityBackupService.createBackup(backupOptionsWithId);
      const stats = UniversityBackupService.getBackupStats(backup);
      setLastBackupStats(stats);
      
      await UniversityBackupService.downloadBackup(backup, selectedFormat);
      
      const formatName = selectedFormat.toUpperCase();
      setMessage({
        type: 'success',
        text: `${formatName} backup created successfully! ${stats.totalRecords} records backed up.`
      });
    } catch (error: any) {
      console.error('Backup creation failed:', error);
      setMessage({
        type: 'error',
        text: `Failed to create backup: ${error.message || 'Please try again.'}`
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleOptionChange = (option: keyof BackupOptions, value: boolean) => {
    setBackupOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Render access denied message if user doesn't have permission
  if (accessDenied) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-red-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
        </div>
        
        {message && (
          <div className="p-4 rounded-lg flex items-center shadow-sm bg-red-100 text-red-800">
            <AlertCircle className="w-6 h-6 mr-3" />
            <span className="font-medium">{message.text}</span>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Backup Access Requirements:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Must be logged in as a University Administrator</li>
            <li>• Can only backup data for your assigned university</li>
            <li>• Account must be approved and active</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Database className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">University Data Backup</h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Securely backup your university's data including teachers, courses, sessions, and feedback. 
          Only data from your university will be included in the backup.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">
              Security: This backup is limited to {user?.name || 'your'} university data only
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center shadow-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          message.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-6 h-6 mr-3" />}
          {message.type === 'error' && <AlertCircle className="w-6 h-6 mr-3" />}
          {message.type === 'info' && <AlertCircle className="w-6 h-6 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Create a New Backup</h3>
        
        <div className="mb-6">
          <label className="block text-md font-semibold text-gray-700 mb-3">1. Select Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            {['json', 'excel', 'csv'].map(format => (
              <label key={format} className="relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
                style={{ borderColor: selectedFormat === format ? '#3B82F6' : '#E5E7EB' }}
              >
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={selectedFormat === format}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                  className="sr-only"
                />
                <div className={`flex flex-col items-center ${selectedFormat === format ? 'text-blue-600' : 'text-gray-600'}`}>
                  {format === 'json' && <FileText className="w-8 h-8 mb-2" />}
                  {format === 'excel' && <FileSpreadsheet className="w-8 h-8 mb-2" />}
                  {format === 'csv' && <Database className="w-8 h-8 mb-2" />}
                  <span className="text-sm font-bold">{format.toUpperCase()}</span>
                </div>
                {selectedFormat === format && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-md font-semibold text-gray-700 mb-3">2. Choose Data to Include</label>
          <div className="space-y-3">
            {[
              { key: 'includeUsers', label: 'Users & Teachers', icon: Users, desc: 'All university staff and their details' },
              { key: 'includeCourses', label: 'Courses & Departments', icon: GraduationCap, desc: 'Academic structure and course information' },
              { key: 'includeSessions', label: 'Response Sessions', icon: BookOpen, desc: 'Evaluation sessions and their configurations' },
              { key: 'includeFeedback', label: 'Feedback & Reviews', icon: MessageSquare, desc: 'Student responses and teacher feedback' }
            ].map(item => (
              <label key={item.key} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupOptions[item.key as keyof BackupOptions] as boolean}
                  onChange={(e) => handleOptionChange(item.key as keyof BackupOptions, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup || accessDenied}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          {isCreatingBackup ? <Loader className="w-6 h-6 mr-3 animate-spin" /> : <Download className="w-6 h-6 mr-3" />}
          {isCreatingBackup ? 'Creating University Backup...' : 'Download University Backup'}
        </button>
      </div>

      {lastBackupStats && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Last Backup Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { label: 'University', value: lastBackupStats.university, color: 'blue' },
              { label: 'Faculties', value: lastBackupStats.faculties, color: 'green' },
              { label: 'Departments', value: lastBackupStats.departments, color: 'purple' },
              { label: 'Teachers', value: lastBackupStats.teachers, color: 'orange' },
              { label: 'Courses', value: lastBackupStats.courses, color: 'red' }
            ].map(stat => (
              <div key={stat.label} className={`bg-${stat.color}-100 p-4 rounded-lg shadow-md`}>
                <div className={`text-2xl font-extrabold text-${stat.color}-600`}>{stat.value}</div>
                <div className={`text-xs font-semibold text-${stat.color}-800 mt-1`}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
            {[
              { label: 'Sessions', value: lastBackupStats.sessions, color: 'indigo' },
              { label: 'Responses', value: lastBackupStats.responses, color: 'pink' },
              { label: 'Feedback', value: lastBackupStats.feedback, color: 'yellow' },
              { label: 'Total Records', value: lastBackupStats.totalRecords, color: 'gray' }
            ].map(stat => (
              <div key={stat.label} className={`bg-${stat.color}-100 p-3 rounded-lg shadow-md`}>
                <div className={`text-xl font-extrabold text-${stat.color}-600`}>{stat.value}</div>
                <div className={`text-xs font-semibold text-${stat.color}-800 mt-1`}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Backup created on {new Date(lastBackupStats.backupDate).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
