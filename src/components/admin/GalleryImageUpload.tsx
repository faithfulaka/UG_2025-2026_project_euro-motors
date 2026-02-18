// src/components/admin/GalleryImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface UploadProps {
  onImageUploaded: () => void;
}

export default function GalleryImageUpload({ onImageUploaded }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !alt) {
      setError('Please fill in all fields and select an image');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('alt', alt);

      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload image');
      }

      setFile(null);
      setPreview('');
      setTitle('');
      setAlt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImageUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Upload Gallery Image</h3>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Image Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-3 focus:outline-none"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative w-full max-w-xs h-48">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Bentley Flying Spur"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Alt Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alt Text (for SEO)
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="e.g., Luxury Bentley Flying Spur in white"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '⏳ Uploading...' : '📤 Upload Image'}
        </button>
      </form>
    </div>
  );
}
