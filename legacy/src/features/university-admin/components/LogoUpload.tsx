import React, { useState, useRef } from 'react';
import { universityAdminService } from '../services/universityAdminService';
import { Upload, Trash2, Loader, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  universityId: string;
  currentLogoPath?: string;
  onLogoUpdated: (logoPath: string) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  universityId,
  currentLogoPath,
  onLogoUpdated
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoPath || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLogoUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzdfbbc2e'}/image/upload/${path}`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must not exceed 2MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_PRESET_NAME || 'university_logos');
      formData.append('folder', 'university_logos');
      formData.append('public_id', `${universityId}-${Date.now()}`);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzdfbbc2e'}/image/upload`;
      
      const response = await fetch(cloudinaryUrl, { method: 'POST', body: formData });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      const result = await response.json();
      if (!result.secure_url) throw new Error('Upload failed: No URL returned');

      const updateResult = await universityAdminService.updateUniversityLogo(universityId, result.secure_url);
      if (!updateResult.success) throw new Error(updateResult.error);

      setPreview(result.secure_url);
      onLogoUpdated(result.secure_url);
      
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentLogoPath) return;

    if (window.confirm('Are you sure you want to remove the university logo?')) {
      setUploading(true);
      try {
        const result = await universityAdminService.updateUniversityLogo(universityId, '');
        if (!result.success) throw new Error(result.error);
        
        setPreview(null);
        onLogoUpdated('');
        
        alert('Logo removed successfully!');
      } catch (error) {
        console.error('Error removing logo:', error);
        alert(`Failed to remove logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">University Logo</h2>
      <p className="text-sm text-gray-600 mb-6">Manage your university's brand identity on the platform.</p>
      
      <div className="flex flex-col items-center space-y-6">
        <div className="w-40 h-40 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={getLogoUrl(preview) || preview}
              alt="University Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-16 h-16 text-gray-400" />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
          >
            {uploading ? <Loader className="animate-spin mr-2" /> : <Upload className="mr-2" />}
            {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
          </button>

          {preview && (
            <button
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="flex items-center px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
              title="Remove logo"
            >
              <Trash2 className="mr-2" />
              Remove
            </button>
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Supported formats: PNG, JPG, JPEG.</p>
          <p>Maximum file size: 2MB.</p>
          <p>Recommended aspect ratio: 1:1 (e.g., 200x200px).</p>
        </div>
      </div>
    </div>
  );
};
