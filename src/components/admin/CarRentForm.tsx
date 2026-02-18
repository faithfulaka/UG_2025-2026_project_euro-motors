'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RentalCar, CarSpecifications, CarFeatures } from '@/types/cars';
import CarImageManager from './CarImageManager';
import ImageUpload from './ImageUpload';

interface CarFormProps {
  car?: RentalCar;
  mode: 'add' | 'edit';
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function CarRentForm({ car, mode, onSubmit, onCancel }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interiorFeatures, setInteriorFeatures] = useState<string[]>([]);
  const [exteriorFeatures, setExteriorFeatures] = useState<string[]>([]);
  const [safetyFeatures, setSafetyFeatures] = useState<string[]>([]);
  const [newInteriorFeature, setNewInteriorFeature] = useState('');
  const [newExteriorFeature, setNewExteriorFeature] = useState('');
  const [newSafetyFeature, setNewSafetyFeature] = useState('');
  const [makeSuggestions, setMakeSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      id: car?.id || '',
      make: car?.make || '',
      model: car?.model || '',
      trim: car?.trim || '',
      year: car?.year || new Date().getFullYear(),
      hourlyRate: car?.hourlyRate || 0,
      dailyRate: car?.dailyRate || 0,
      weeklyRate: car?.weeklyRate || 0,
      description: car?.description || '',
      isAvailable: car?.isAvailable ?? true,
      // Specifications
      color: car?.specifications?.color || '',
      interiorColor: car?.specifications?.interiorColor || '',
      mileage: car?.specifications?.mileage || 0,
      engine: car?.specifications?.engine || '',
      horsePower: car?.specifications?.horsePower || 0,
      torque: car?.specifications?.torque || '',
      fuelType: car?.specifications?.fuelType || '',
      transmission: car?.specifications?.transmission || '',
      driveType: car?.specifications?.driveType || '',
      bodyType: car?.specifications?.bodyType || '',
      doors: car?.specifications?.doors || 4,
      seats: car?.specifications?.seats || 5,
      topSpeed: car?.specifications?.topSpeed || '',
      acceleration100: car?.specifications?.acceleration100 || '',
      powerKW: car?.specifications?.powerKW || '',
      powerPS: car?.specifications?.powerPS || '',
      weight: car?.specifications?.weight || '',
      wheelbase: car?.specifications?.wheelbase || '',
      wheelSize: car?.specifications?.wheelSize || '',
      brakeColor: car?.specifications?.brakeColor || '',
    }
  });

  // Initialize features if editing
  useEffect(() => {
    if (car) {
      if (car.features?.interior) setInteriorFeatures(car.features.interior);
      if (car.features?.exterior) setExteriorFeatures(car.features.exterior);
      if (car.features?.safety) setSafetyFeatures(car.features.safety);
    }
  }, [car]);

  // Load makes from database
  useEffect(() => {
    async function fetchMakes() {
      try {
        const response = await fetch('/api/db/makes');
        if (response.ok) {
          const data = await response.json();
          setMakeSuggestions(data.makes || []);
        }
      } catch (error) {
        console.error('Error fetching makes:', error);
      }
    }
    fetchMakes();
  }, []);

  // Load models when make changes
  const currentMake = watch('make');
  useEffect(() => {
    if (currentMake) {
      async function fetchModels() {
        try {
          const response = await fetch(`/api/db/models?make=${encodeURIComponent(currentMake)}`);
          if (response.ok) {
            const data = await response.json();
            setModelSuggestions(data.models || []);
          }
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      }
      fetchModels();
    } else {
      setModelSuggestions([]);
    }
  }, [currentMake]);

  // Feature management functions
  const addInteriorFeature = () => {
    if (newInteriorFeature.trim() !== '') {
      setInteriorFeatures([...interiorFeatures, newInteriorFeature.trim()]);
      setNewInteriorFeature('');
    }
  };

  const removeInteriorFeature = (index: number) => {
    setInteriorFeatures(interiorFeatures.filter((_, i) => i !== index));
  };

  const addExteriorFeature = () => {
    if (newExteriorFeature.trim() !== '') {
      setExteriorFeatures([...exteriorFeatures, newExteriorFeature.trim()]);
      setNewExteriorFeature('');
    }
  };

  const removeExteriorFeature = (index: number) => {
    setExteriorFeatures(exteriorFeatures.filter((_, i) => i !== index));
  };

  const addSafetyFeature = () => {
    if (newSafetyFeature.trim() !== '') {
      setSafetyFeatures([...safetyFeatures, newSafetyFeature.trim()]);
      setNewSafetyFeature('');
    }
  };

  const removeSafetyFeature = (index: number) => {
    setSafetyFeatures(safetyFeatures.filter((_, i) => i !== index));
  };

  const submitForm = async (formData: any) => {
    try {
      const specifications: CarSpecifications = {
        color: formData.color,
        interiorColor: formData.interiorColor,
        mileage: parseInt(formData.mileage) || 0,
        engine: formData.engine,
        horsePower: parseInt(formData.horsePower) || 0,
        torque: formData.torque,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        driveType: formData.driveType,
        bodyType: formData.bodyType,
        seats: parseInt(formData.seats) || 5,
        doors: parseInt(formData.doors) || 4,
        topSpeed: formData.topSpeed,
        acceleration100: formData.acceleration100,
        powerKW: formData.powerKW,
        powerPS: formData.powerPS,
        weight: formData.weight,
        wheelbase: formData.wheelbase,
        wheelSize: formData.wheelSize,
        brakeColor: formData.brakeColor,
      };

      const features: CarFeatures = {
        interior: interiorFeatures,
        exterior: exteriorFeatures,
        safety: safetyFeatures,
      };

      const submitData = {
        make: formData.make,
        model: formData.model,
        trim: formData.trim || null,
        year: parseInt(formData.year),
        hourlyRate: parseFloat(formData.hourlyRate),
        dailyRate: parseFloat(formData.dailyRate),
        weeklyRate: parseFloat(formData.weeklyRate),
        description: formData.description,
        isAvailable: formData.isAvailable === 'true' || formData.isAvailable === true,
        specifications: JSON.stringify(specifications),
        features: JSON.stringify(features),
      };

      await onSubmit(submitData as any);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-8">
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {mode === 'add' ? 'Add New Rental Car' : 'Edit Rental Car'}
        </h2>

        {/* Basic Information */}
        <h3 className="text-lg font-medium mb-4 text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make*</label>
            <input
              type="text"
              {...register('make', { required: 'Make is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              list="make-suggestions"
              onFocus={() => setShowMakeSuggestions(true)}
              onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 200)}
            />
            {showMakeSuggestions && makeSuggestions.length > 0 && (
              <datalist id="make-suggestions">
                {makeSuggestions.map((make) => (
                  <option key={make} value={make} />
                ))}
              </datalist>
            )}
            {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model*</label>
            <input
              type="text"
              {...register('model', { required: 'Model is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              list="model-suggestions"
              onFocus={() => setShowModelSuggestions(true)}
              onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
            />
            {showModelSuggestions && modelSuggestions.length > 0 && (
              <datalist id="model-suggestions">
                {modelSuggestions.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            )}
            {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trim</label>
            <input
              type="text"
              {...register('trim')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year*</label>
            <input
              type="number"
              {...register('year', { required: 'Year is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)*</label>
            <input
              type="number"
              step="0.01"
              {...register('hourlyRate', { required: 'Hourly rate is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            {errors.hourlyRate && <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate ($)*</label>
            <input
              type="number"
              step="0.01"
              {...register('dailyRate', { required: 'Daily rate is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            {errors.dailyRate && <p className="mt-1 text-sm text-red-600">{errors.dailyRate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Rate ($)*</label>
            <input
              type="number"
              step="0.01"
              {...register('weeklyRate', { required: 'Weekly rate is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            {errors.weeklyRate && <p className="mt-1 text-sm text-red-600">{errors.weeklyRate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
            <select
              {...register('isAvailable')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* Specifications */}
        <h3 className="text-lg font-medium mb-4 text-gray-900">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color*</label>
            <input type="text" {...register('color', { required: 'Color is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interior Color*</label>
            <input type="text" {...register('interiorColor', { required: 'Interior color is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.interiorColor && <p className="mt-1 text-sm text-red-600">{errors.interiorColor.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Engine*</label>
            <input type="text" {...register('engine', { required: 'Engine is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.engine && <p className="mt-1 text-sm text-red-600">{errors.engine.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type*</label>
            <input type="text" {...register('fuelType', { required: 'Fuel type is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.fuelType && <p className="mt-1 text-sm text-red-600">{errors.fuelType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transmission*</label>
            <input type="text" {...register('transmission', { required: 'Transmission is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.transmission && <p className="mt-1 text-sm text-red-600">{errors.transmission.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drive Type*</label>
            <input type="text" {...register('driveType', { required: 'Drive type is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.driveType && <p className="mt-1 text-sm text-red-600">{errors.driveType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Type*</label>
            <input type="text" {...register('bodyType', { required: 'Body type is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
            {errors.bodyType && <p className="mt-1 text-sm text-red-600">{errors.bodyType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horsepower</label>
            <input type="number" {...register('horsePower')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doors</label>
            <input type="number" {...register('doors')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
            <input type="number" {...register('seats')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
            <input type="number" {...register('mileage')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Torque</label>
            <input type="text" {...register('torque')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white" />
          </div>
        </div>

        {/* Features - Interior */}
        <h3 className="text-lg font-medium mb-4 text-gray-900">Features</h3>
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Interior Features*</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newInteriorFeature}
              onChange={(e) => setNewInteriorFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInteriorFeature();
                }
              }}
              placeholder="e.g., Leather seats"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            <button
              type="button"
              onClick={addInteriorFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {interiorFeatures.length === 0 && (
            <p className="text-sm text-red-600 mb-2">At least one interior feature is required*</p>
          )}
          <div className="space-y-1">
            {interiorFeatures.map((feature, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm text-gray-700">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeInteriorFeature(index)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features - Exterior */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Exterior Features*</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newExteriorFeature}
              onChange={(e) => setNewExteriorFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExteriorFeature();
                }
              }}
              placeholder="e.g., Alloy wheels"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            <button
              type="button"
              onClick={addExteriorFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {exteriorFeatures.length === 0 && (
            <p className="text-sm text-red-600 mb-2">At least one exterior feature is required*</p>
          )}
          <div className="space-y-1">
            {exteriorFeatures.map((feature, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm text-gray-700">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeExteriorFeature(index)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features - Safety */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Safety Features*</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSafetyFeature}
              onChange={(e) => setNewSafetyFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSafetyFeature();
                }
              }}
              placeholder="e.g., ABS brakes"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            <button
              type="button"
              onClick={addSafetyFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {safetyFeatures.length === 0 && (
            <p className="text-sm text-red-600 mb-2">At least one safety feature is required*</p>
          )}
          <div className="space-y-1">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm text-gray-700">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeSafetyFeature(index)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Image Upload Section */}
        <div className="mb-6">
          <ImageUpload 
            carId={car?.id}
            existingImages={car?.images?.filter(img => !img.url.startsWith('blob:')).map(img => ({
              id: img.id,
              url: img.url,
              isMain: img.isMain
            })) || []}
            onImagesChange={(newImages) => {
              // Images should be uploaded via the upload-images endpoint
            }}
            onFilesSelected={(files) => {
              // Store selected files
            }}
          />
        </div>

        {/* Existing Images Manager */}
        {car?.id && car?.images && car.images.length > 0 && (
          <div className="mb-6">
            <CarImageManager
              carId={car.id}
              existingImages={car.images.map(img => ({
                id: img.id,
                url: img.url,
                isMain: img.isMain,
              }))}
              onImagesUpdated={(updatedImages) => {
                window.location.reload();
              }}
              carType="rent"
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Rental Car' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
