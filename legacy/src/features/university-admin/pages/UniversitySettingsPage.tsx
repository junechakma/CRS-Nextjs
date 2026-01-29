import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store/store';
import DashboardLayout from '../../../shared/components/layout/DashboardLayout';
import { LogoUpload } from '../components/LogoUpload';
import { BackupManagerComponent } from '../components/BackupManager';
import { supabase } from '../../../lib/supabase';

interface UniversityData {
  id: string;
  name: string;
  code: string;
  logo_path?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export default function UniversitySettingsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [universityData, setUniversityData] = useState<UniversityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.university_id) {
      fetchUniversityData();
    }
  }, [user]);

  const fetchUniversityData = async () => {
    if (!user?.university_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', user.university_id)
        .single();

      if (error) throw error;
      setUniversityData(data);
    } catch (error) {
      console.error('Error fetching university data:', error);
      setError('Failed to load university data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpdated = (logoPath: string) => {
    if (universityData) {
      setUniversityData({
        ...universityData,
        logo_path: logoPath
      });
    }
  };

  const handleBack = () => {
    navigate('/university-admin');
  };

  if (!user?.university_id) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
            <p className="font-bold">Access Denied</p>
            <p>You are not assigned to a university. Please contact support.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center">
              <Settings className="w-10 h-10 mr-4 text-blue-600" />
              University Settings
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage your university's profile, branding, and data options.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors duration-300 shadow-md"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {universityData && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <LogoUpload
                  universityId={universityData.id}
                  currentLogoPath={universityData.logo_path}
                  onLogoUpdated={handleLogoUpdated}
                />
              </div>
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">University Information</h2>
                <div className="space-y-5">
                  {Object.entries({
                    "University Name": universityData.name,
                    "University Code": universityData.code,
                    "Address": universityData.address,
                    "City": universityData.city,
                    "State": universityData.state,
                    "Country": universityData.country,
                    "Email": universityData.email,
                    "Phone": universityData.phone,
                  }).map(([label, value]) => value && (
                    <div key={label}>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                      <p className="mt-1 text-md text-gray-900">{value}</p>
                    </div>
                  ))}
                  {universityData.website && (
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Website</label>
                      <p className="mt-1 text-md text-gray-900">
                        <a 
                          href={universityData.website.startsWith('http') ? universityData.website : `https://${universityData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {universityData.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Info className="w-5 h-5 mr-3 text-blue-500" />
                    <p>
                      To update university information, please contact your system administrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <BackupManagerComponent universityId={universityData.id} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
