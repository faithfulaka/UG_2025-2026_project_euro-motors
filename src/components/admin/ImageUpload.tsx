'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  carId?: string;
  carType?: 'buy' | 'rent';
  existingImages?: Array<{ id: string; url: string; isMain: boolean }>;
  onImagesChange?: (images: Array<{ url: string; isMain: boolean; imageType: string | null }>) => void;
  onFilesSelected?: (files: Array<{ file: File; isMain: boolean }>) => void;
}

export default function ImageUpload({ carId, carType = 'buy', existingImages = [], onImagesChange, onFilesSelected }: ImageUploadProps) {
  const [images, setImages] = useState<Array<{ file: File; preview: string; isMain: boolean }>>([]);
  const [uploading, setUploading] = useState(false);
  const [displayedImages, setDisplayedImages] = useState(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update displayed images when existingImages prop changes
  useEffect(() => {
    console.log('ImageUpload: existingImages changed', existingImages);
    setDisplayedImages(existingImages);
  }, [existingImages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: Array<{ file: File; preview: string; isMain: boolean }> = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          isMain: images.length === 0 && existingImages.length === 0 && newImages.length === 0
        });
      }
    });

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    updateParentImages(updatedImages);
    
    // Notify parent about selected files
    if (onFilesSelected) {
      onFilesSelected(updatedImages.map(img => ({ file: img.file, isMain: img.isMain })));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the main image, make the first one main
    if (newImages.length > 0 && images[index].isMain) {
      newImages[0].isMain = true;
    }
    setImages(newImages);
    updateParentImages(newImages);
    
    // Notify parent about selected files
    if (onFilesSelected) {
      onFilesSelected(newImages.map(img => ({ file: img.file, isMain: img.isMain })));
    }
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setImages(newImages);
    updateParentImages(newImages);
    
    // Notify parent about selected files
    if (onFilesSelected) {
      onFilesSelected(newImages.map(img => ({ file: img.file, isMain: img.isMain })));
    }
  };

  const updateParentImages = (imgs: Array<{ file: File; preview: string; isMain: boolean }>) => {
    // Don't update parent with preview URLs - only update after actual upload
    // This prevents blob URLs from being passed to the form
  };
  
  // Expose method to upload images programmatically
  const uploadImages = async (newCarId: string, carType: string = 'buy') => {
    if (images.length === 0) {
      return { success: true, uploaded: 0 };
    }

    setUploading(true);
    try {
      const formData = new FormData();
      images.forEach((img, index) => {
        formData.append(`image${index + 1}`, img.file);
      });
      formData.append('carId', newCarId);
      formData.append('type', carType);

      const response = await fetch('/api/admin/cars/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      
      if (data.success && data.images) {
        setImages([]);
        
        // Update displayed images with newly uploaded ones
        const newDisplayedImages = data.images.map((img: any) => ({
          id: `new-${Date.now()}-${Math.random()}`,
          url: img.url,
          isMain: img.isMain
        }));
        setDisplayedImages([...displayedImages, ...newDisplayedImages]);
        
        if (onImagesChange) {
          onImagesChange(data.images);
        }
        
        return { success: true, uploaded: data.images.length };
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('Please select images to upload');
      return;
    }

    if (!carId && !existingImages.length) {
      alert('Please save the car first to get an ID, then you can upload images');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      images.forEach((img, index) => {
        formData.append(`image${index + 1}`, img.file);
      });
      formData.append('carId', carId || '');
      formData.append('type', carType);

      const response = await fetch('/api/admin/cars/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success && data.images) {
        alert(`Successfully uploaded ${data.images.length} image(s)!`);
        setImages([]);
        
        // Update displayed images with newly uploaded ones
        const newDisplayedImages = data.images.map((img: any) => ({
          id: `new-${Date.now()}-${Math.random()}`,
          url: img.url,
          isMain: img.isMain
        }));
        setDisplayedImages([...displayedImages, ...newDisplayedImages]);
        
        if (onImagesChange) {
          onImagesChange(data.images);
        }
        
        // Reload the page after a short delay to show all images
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add New Car Images
        </label>

        {/* New Image Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
          >
            Select Images
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Select up to 11 images (JPG, PNG, etc.)
          </p>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Selected Images ({images.length}/11):</p>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <div className={`aspect-square relative border-2 rounded-lg overflow-hidden ${
                    img.isMain ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    <Image
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {img.isMain && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    >
                      ×
                    </button>
                    {!img.isMain && (
                      <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        className="absolute bottom-1 left-1 bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-900"
                      >
                        Set Main
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-600">
                    pov{index + 1}.jpg
                  </p>
                </div>
              ))}
            </div>
            
            {carId && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
