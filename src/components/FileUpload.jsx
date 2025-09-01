// src/components/FileUpload.jsx
import React, { useState } from 'react';  // ADD THIS LINE - React import was missing!
import { supabase } from '../utils/supabaseClient';

const FileUpload = ({ assessmentId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Supabase Storage
      const filePath = `${assessmentId}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('assessment-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assessment-files')
        .getPublicUrl(filePath);

      // Save file reference to database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert([
          {
            assessment_id: assessmentId,
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size
          }
        ]);

      if (dbError) throw dbError;

      // Update local state
      setUploadedFiles([...uploadedFiles, {
        name: file.name,
        url: publicUrl,
        type: file.type
      }]);

      // Clear the input
      e.target.value = '';
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <span className="font-medium text-purple-600">Click to upload</span>
                  <span> or drag and drop</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              PDF, Word, or Image files (Max 10MB)
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-800 mb-2">Uploaded Files:</p>
          <ul className="space-y-1">
            {uploadedFiles.map((file, idx) => (
              <li key={idx} className="text-sm text-green-600">
                ✓ {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;