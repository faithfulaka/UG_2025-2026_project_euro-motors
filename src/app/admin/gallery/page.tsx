// src/app/admin/gallery/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import GalleryImageUpload from '@/components/admin/GalleryImageUpload';

interface GalleryImage {
  id: string;
  title: string;
  alt: string;
  url: string;
  order: number;
  isActive: boolean;
}

export default function GalleryManagementPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      const data = await response.json();
      // Ensure data is an array
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter((img) => img.id !== id));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const updated = await response.json();
        setImages(images.map((img) => (img.id === id ? updated : img)));
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleEditSave = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, alt: editAlt }),
      });

      if (response.ok) {
        const updated = await response.json();
        setImages(images.map((img) => (img.id === id ? updated : img)));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!Array.isArray(images) || index === 0) return;

    const img1 = images[index];
    const img2 = images[index - 1];

    try {
      await Promise.all([
        fetch(`/api/admin/gallery/${img1.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: img2.order }),
        }),
        fetch(`/api/admin/gallery/${img2.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: img1.order }),
        }),
      ]);
      fetchImages();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!Array.isArray(images) || index === images.length - 1) return;

    const img1 = images[index];
    const img2 = images[index + 1];

    try {
      await Promise.all([
        fetch(`/api/admin/gallery/${img1.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: img2.order }),
        }),
        fetch(`/api/admin/gallery/${img2.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: img1.order }),
        }),
      ]);
      fetchImages();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GalleryImageUpload onImageUploaded={fetchImages} />
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Images</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{Array.isArray(images) ? images.length : 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {Array.isArray(images) ? images.filter((img) => img.isActive).length : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Images List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Gallery Images</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p>Loading images...</p>
          </div>
        ) : !Array.isArray(images) || images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No images uploaded yet</p>
            <p className="text-sm">Upload images using the form above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`flex items-center gap-4 p-4 border rounded-lg transition ${
                  image.isActive
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {/* Image Thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover rounded"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {editingId === image.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editAlt}
                        onChange={(e) => setEditAlt(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Alt text"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-gray-900">{image.title}</p>
                      <p className="text-sm text-gray-600">{image.alt}</p>
                      <p className="text-xs text-gray-400 mt-1">{image.url}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Order Controls */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded transition"
                      title="Move up"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === images.length - 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded transition"
                      title="Move down"
                    >
                      ⬇️
                    </button>
                  </div>

                  {/* Edit/Save */}
                  {editingId === image.id ? (
                    <button
                      onClick={() => handleEditSave(image.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(image.id);
                        setEditTitle(image.title);
                        setEditAlt(image.alt);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                  )}

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(image.id, image.isActive)}
                    className={`px-3 py-1 text-sm rounded transition ${
                      image.isActive
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                    title={image.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {image.isActive ? '👁️' : '🚫'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
