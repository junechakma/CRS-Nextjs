import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { universityAdminService } from '../features/university-admin/services/universityAdminService';

interface PublicUniversity {
  id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  country?: string;
  logo_path?: string;
  website?: string;
}

export const UniversitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<PublicUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const result = await universityAdminService.getAllPublicUniversities();
      
      if (result.success) {
        setUniversities(result.universities);
      } else {
        setError(result.error || 'Failed to load universities');
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoPath?: string) => {
    if (!logoPath) return undefined;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/university-logos/${logoPath}`;
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading universities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-semibold mb-4">Error Loading Universities</h2>
            <p className="mb-6">{error}</p>
            <button
              onClick={handleBackToHome}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search universities by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredUniversities.length} of {universities.length} universities
          </p>
        </div>

        {/* Universities Grid */}
        {filteredUniversities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No universities found</h3>
              <p>Try adjusting your search terms.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <Link
                key={university.id}
                to={`/university/${university.code}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 block group"
              >
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {university.logo_path ? (
                      <img
                        src={getLogoUrl(university.logo_path)}
                        alt={`${university.name} Logo`}
                        className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* University Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {university.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">Code: {university.code}</p>
                    
                    {(university.city || university.state || university.country) && (
                      <p className="text-sm text-gray-500 mb-2">
                        {[university.city, university.state, university.country]
                          .filter(Boolean)
                          .join(', ')
                        }
                      </p>
                    )}

                    {university.website && (
                      <p className="text-sm text-blue-600 truncate">
                        {university.website}
                      </p>
                    )}

                    <div className="mt-3">
                      <span className="inline-flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                        View Details
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};