'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TrashIcon, StarIcon } from '@heroicons/react/24/outline';

interface ExistingImage {
  id?: string;
  url: string;
  isMain: boolean;
}

interface CarImageManagerProps {
  carId: string;
  existingImages: ExistingImage[];
  onImagesUpdated: (images: ExistingImage[]) => void;
  carType?: 'buy' | 'rent';
}

export default function CarImageManager({
  carId,
  existingImages,
  onImagesUpdated,
  carType = 'buy'
}: CarImageManagerProps) {
  const [images, setImages] = useState<ExistingImage[]>(existingImages);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingMain, setIsUpdatingMain] = useState<string | null>(null);

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsDeleting(imageUrl);
    try {
      const response = await fetch(`/api/admin/cars/${carId}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          carType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }

      const updatedImages = images.filter(img => img.url !== imageUrl);
      setImages(updatedImages);
      onImagesUpdated(updatedImages);
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete image');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetMainImage = async (imageUrl: string) => {
    setIsUpdatingMain(imageUrl);
    try {
      const response = await fetch(`/api/admin/cars/${carId}/images/main`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          carType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set main image');
      }

      const updatedImages = images.map(img => ({
        ...img,
        isMain: img.url === imageUrl,
      }));
      setImages(updatedImages);
      onImagesUpdated(updatedImages);
      alert('Main image updated successfully');
    } catch (error) {
      console.error('Error updating main image:', error);
      alert(error instanceof Error ? error.message : 'Failed to update main image');
    } finally {
      setIsUpdatingMain(null);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
        <span>Uploaded Images</span>
        <span className="text-sm font-normal bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
          {images.length}
        </span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.url}
            className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-red-300 transition"
          >
            {/* Image */}
            <div className="aspect-square relative">
              <Image
                src={image.url.startsWith('/') ? image.url : `/${image.url}`}
                alt="Car image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2">
              {/* Main Badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <StarIcon className="w-3 h-3" />
                  Main
                </div>
              )}

              {/* Action Buttons (visible on hover) */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                {/* Set as Main */}
                {!image.isMain && (
                  <button
                    onClick={() => handleSetMainImage(image.url)}
                    disabled={isUpdatingMain === image.url}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:bg-blue-400 shadow-lg"
                    title="Set as main image"
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDeleteImage(image.url)}
                  disabled={isDeleting === image.url}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition disabled:bg-red-400 shadow-lg"
                  title="Delete image"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {(isDeleting === image.url || isUpdatingMain === image.url) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Hover over images to delete or set as main image.
        </p>
      </div>
    </div>
  );
}
