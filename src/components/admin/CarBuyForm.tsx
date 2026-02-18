'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BuyCar, CarSpecifications } from '@/types/cars';


interface CarFormProps {
  car?: BuyCar;
  mode: 'add' | 'edit';
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function CarBuyForm({ car, mode, onSubmit, onCancel }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interiorFeatures, setInteriorFeatures] = useState<string[]>([]);
  const [exteriorFeatures, setExteriorFeatures] = useState<string[]>([]);
  const [safetyFeatures, setSafetyFeatures] = useState<string[]>([]);
  const [standardEquipment, setStandardEquipment] = useState<string[]>([]);
  const [addedOptions, setAddedOptions] = useState<string[]>([]);
  const [newInteriorFeature, setNewInteriorFeature] = useState('');
  const [newExteriorFeature, setNewExteriorFeature] = useState('');
  const [newSafetyFeature, setNewSafetyFeature] = useState('');
  const [newStandardEquipment, setNewStandardEquipment] = useState('');
  const [newAddedOption, setNewAddedOption] = useState('');
  const [useScraperData, setUseScraperData] = useState(false);
  const [scrapedMakes, setScrapedMakes] = useState<string[]>([]);
  const [scrapedModels, setScrapedModels] = useState<string[]>([]);
  const [loadingScraperData, setLoadingScraperData] = useState(false);
  const [scraperMake, setScraperMake] = useState('');
  const [scraperModel, setScraperModel] = useState('');
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      id: car?.id || '',
      make: car?.make || '',
      model: car?.model || '',
      trim: car?.trim || '',
      year: car?.year || new Date().getFullYear(),
      price: car?.price || 0,
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

  // Initialize arrays if editing an existing car
  useEffect(() => {
    if (car) {
      if (car.features?.interior) setInteriorFeatures(car.features.interior);
      if (car.features?.exterior) setExteriorFeatures(car.features.exterior);
      if (car.features?.safety) setSafetyFeatures(car.features.safety);
      if (car.standardEquipment) setStandardEquipment(car.standardEquipment);
      if (car.addedOptions) setAddedOptions(car.addedOptions);
    }
  }, [car]);

  // Load scraper makes on component mount
  useEffect(() => {
    async function fetchScraperMakes() {
      try {
        const response = await fetch('/api/admin/scraper/makes');
        if (response.ok) {
          const data = await response.json();
          setScrapedMakes(data);
        }
      } catch (error) {
        console.error('Error fetching makes:', error);
      }
    }
    
    fetchScraperMakes();
  }, []);

  // Load scraper models when make is selected
  useEffect(() => {
    if (!scraperMake) {
      setScrapedModels([]);
      return;
    }
    
    async function fetchScraperModels() {
      try {
        const response = await fetch(`/api/admin/scraper/models?make=${scraperMake}`);
        if (response.ok) {
          const data = await response.json();
          setScrapedModels(data);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
    
    fetchScraperModels();
  }, [scraperMake]);

  // Add interior feature
  const addInteriorFeature = () => {
    if (newInteriorFeature.trim() !== '') {
      setInteriorFeatures([...interiorFeatures, newInteriorFeature.trim()]);
      setNewInteriorFeature('');
    }
  };

  // Remove interior feature
  const removeInteriorFeature = (index: number) => {
    setInteriorFeatures(interiorFeatures.filter((_, i) => i !== index));
  };

  // Add exterior feature
  const addExteriorFeature = () => {
    if (newExteriorFeature.trim() !== '') {
      setExteriorFeatures([...exteriorFeatures, newExteriorFeature.trim()]);
      setNewExteriorFeature('');
    }
  };

  // Remove exterior feature
  const removeExteriorFeature = (index: number) => {
    setExteriorFeatures(exteriorFeatures.filter((_, i) => i !== index));
  };

  // Add safety feature
  const addSafetyFeature = () => {
    if (newSafetyFeature.trim() !== '') {
      setSafetyFeatures([...safetyFeatures, newSafetyFeature.trim()]);
      setNewSafetyFeature('');
    }
  };

  // Remove safety feature
  const removeSafetyFeature = (index: number) => {
    setSafetyFeatures(safetyFeatures.filter((_, i) => i !== index));
  };

  // Add standard equipment
  const addStandardEquipmentItem = () => {
    if (newStandardEquipment.trim() !== '') {
      setStandardEquipment([...standardEquipment, newStandardEquipment.trim()]);
      setNewStandardEquipment('');
    }
  };

  // Remove standard equipment
  const removeStandardEquipment = (index: number) => {
    setStandardEquipment(standardEquipment.filter((_, i) => i !== index));
  };

  // Add option
  const addOption = () => {
    if (newAddedOption.trim() !== '') {
      setAddedOptions([...addedOptions, newAddedOption.trim()]);
      setNewAddedOption('');
    }
  };

  // Remove option
  const removeOption = (index: number) => {
    setAddedOptions(addedOptions.filter((_, i) => i !== index));
  };

  // Load data from scraper
  const loadScraperData = async () => {
    if (!scraperMake || !scraperModel) {
      alert('Please select a make and model first.');
      return;
    }
    
    setLoadingScraperData(true);
    
    try {
      const year = watch('year');
      const response = await fetch(`/api/admin/scraper/search?make=${scraperMake}&model=${scraperModel}&year=${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch car data');
      }
      
      const data = await response.json();
      
      if (!data) {
        alert('No data found for this car. Please try different search criteria.');
        setLoadingScraperData(false);
        return;
      }
      
      // Set form values from scraper data
      setValue('make', data.make);
      setValue('model', data.model);
      setValue('trim', data.trim || '');
      setValue('year', data.year);
      setValue('price', data.price);
      setValue('description', data.description || '');
      
      // Set specifications
      if (data.specifications) {
        setValue('color', data.specifications.color || '');
        setValue('interiorColor', data.specifications.interiorColor || '');
        setValue('mileage', data.specifications.mileage || 0);
        setValue('engine', data.specifications.engine || '');
        setValue('horsePower', data.specifications.horsePower || 0);
        setValue('torque', data.specifications.torque || '');
        setValue('fuelType', data.specifications.fuelType || '');
        setValue('transmission', data.specifications.transmission || '');
        setValue('driveType', data.specifications.driveType || '');
        setValue('bodyType', data.specifications.bodyType || '');
        setValue('doors', data.specifications.doors || 4);
        setValue('seats', data.specifications.seats || 5);
        setValue('topSpeed', data.specifications.topSpeed || '');
        setValue('acceleration100', data.specifications.acceleration100 || '');
        setValue('powerKW', data.specifications.powerKW || '');
        setValue('powerPS', data.specifications.powerPS || '');
        setValue('weight', data.specifications.weight || '');
        setValue('wheelbase', data.specifications.wheelbase || '');
        setValue('wheelSize', data.specifications.wheelSize || '');
        setValue('brakeColor', data.specifications.brakeColor || '');
      }
      
      // Set features
      if (data.features) {
        if (data.features.interior) setInteriorFeatures(data.features.interior);
        if (data.features.exterior) setExteriorFeatures(data.features.exterior);
        if (data.features.safety) setSafetyFeatures(data.features.safety);
      }
      
      // Set equipment
      if (data.standardEquipment) setStandardEquipment(data.standardEquipment);
      if (data.addedOptions) setAddedOptions(data.addedOptions);
      
    } catch (error) {
      console.error('Error loading scraper data:', error);
      alert('Failed to load data from scraper. Please try again or enter data manually.');
    } finally {
      setLoadingScraperData(false);
    }
  };

  const submitForm = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Combine features
      const features = {
        interior: interiorFeatures,
        exterior: exteriorFeatures,
        safety: safetyFeatures,
      };
      
      // Combine specifications
      const specifications: CarSpecifications = {
        color: formData.color,
        interiorColor: formData.interiorColor,
        mileage: Number(formData.mileage),
        engine: formData.engine,
        horsePower: Number(formData.horsePower),
        torque: formData.torque,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        driveType: formData.driveType,
        bodyType: formData.bodyType,
        doors: Number(formData.doors),
        seats: Number(formData.seats),
        topSpeed: formData.topSpeed,
        acceleration100: formData.acceleration100,
        powerKW: formData.powerKW,
        powerPS: formData.powerPS,
        weight: formData.weight,
        wheelbase: formData.wheelbase,
        wheelSize: formData.wheelSize,
        brakeColor: formData.brakeColor,
      };
      
      // Create final data object
      const finalData = {
        ...formData,
        price: Number(formData.price),
        year: Number(formData.year),
        specifications,
        features,
        standardEquipment,
        addedOptions,
      };
      
      await onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-8">
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">{mode === 'add' ? 'Add New Car' : 'Edit Car'}</h2>
        
        {/* Scraper section */}
        <div className="mb-6 p-4 border border-blue-200 rounded-md bg-blue-50">
          <h3 className="text-lg font-medium mb-2">Car Scraper Tool</h3>
          <p className="text-sm text-gray-600 mb-4">
            Search for car details across multiple sources and auto-fill the form.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </label>
              <select
                value={scraperMake}
                onChange={(e) => setScraperMake(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Make</option>
                {scrapedMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={scraperModel}
                onChange={(e) => setScraperModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!scraperMake}
              >
                <option value="">Select Model</option>
                {scrapedModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={loadScraperData}
                disabled={loadingScraperData || !scraperMake || !scraperModel}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              >
                {loadingScraperData ? 'Loading...' : 'Load Data'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Basic Information */}
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make*
            </label>
            <input
              type="text"
              {...register('make', { required: 'Make is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.make && (
              <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model*
            </label>
            <input
              type="text"
              {...register('model', { required: 'Model is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trim
            </label>
            <input
              type="text"
              {...register('trim')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year*
            </label>
            <input
              type="number"
              {...register('year', { 
                required: 'Year is required',
                min: { value: 1900, message: 'Year must be 1900 or later' },
                max: { value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (£)*
            </label>
            <input
              type="number"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              {...register('isAvailable')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>
        
        {/* Specifications */}
        <h3 className="text-lg font-medium mb-4">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exterior Color
            </label>
            <input
              type="text"
              {...register('color')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interior Color
            </label>
            <input
              type="text"
              {...register('interiorColor')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mileage
            </label>
            <input
              type="number"
              {...register('mileage', { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine
            </label>
            <input
              type="text"
              {...register('engine')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horsepower
            </label>
            <input
              type="number"
              {...register('horsePower', { min: 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Torque
            </label>
            <input
              type="text"
              {...register('torque')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              {...register('fuelType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Plug-in Hybrid">Plug-in Hybrid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <select
              {...register('transmission')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drive Type
            </label>
            <select
              {...register('driveType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Drive Type</option>
              <option value="Front-Wheel Drive">Front-Wheel Drive</option>
              <option value="Rear-Wheel Drive">Rear-Wheel Drive</option>
              <option value="All-Wheel Drive">All-Wheel Drive</option>
              <option value="Four-Wheel Drive">Four-Wheel Drive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Type
            </label>
            <select
              {...register('bodyType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Body Type</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Estate">Estate</option>
              <option value="Sports Car">Sports Car</option>
              <option value="Super Car">Super Car</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doors
            </label>
            <input
              type="number"
              {...register('doors', { min: 1, max: 5 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seats
            </label>
            <input
              type="number"
              {...register('seats', { min: 1, max: 9 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Additional specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top Speed
            </label>
            <input
              type="text"
              {...register('topSpeed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              0-100 km/h
            </label>
            <input
              type="text"
              {...register('acceleration100')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Power (kW)
            </label>
            <input
              type="text"
              {...register('powerKW')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Power (PS)
            </label>
            <input
              type="text"
              {...register('powerPS')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight
            </label>
            <input
              type="text"
              {...register('weight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wheelbase
            </label>
            <input
              type="text"
              {...register('wheelbase')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wheel Size
            </label>
            <input
              type="text"
              {...register('wheelSize')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brake Color
            </label>
            <input
              type="text"
              {...register('brakeColor')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Features */}
        <h3 className="text-lg font-medium mb-4">Features</h3>
        
        {/* Interior Features */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interior Features
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newInteriorFeature}
              onChange={(e) => setNewInteriorFeature(e.target.value)}
              placeholder="Add interior feature"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addInteriorFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {interiorFeatures.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {interiorFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeInteriorFeature(index)}
                    className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Exterior Features */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exterior Features
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newExteriorFeature}
              onChange={(e) => setNewExteriorFeature(e.target.value)}
              placeholder="Add exterior feature"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addExteriorFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {exteriorFeatures.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {exteriorFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeExteriorFeature(index)}
                    className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Safety Features */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Safety Features
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newSafetyFeature}
              onChange={(e) => setNewSafetyFeature(e.target.value)}
              placeholder="Add safety feature"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addSafetyFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {safetyFeatures.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {safetyFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeSafetyFeature(index)}
                    className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Standard Equipment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Standard Equipment
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newStandardEquipment}
              onChange={(e) => setNewStandardEquipment(e.target.value)}
              placeholder="Add standard equipment"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addStandardEquipmentItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {standardEquipment.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {standardEquipment.map((equipment, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{equipment}</span>
                  <button
                    type="button"
                    onClick={() => removeStandardEquipment(index)}
                    className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Added Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Added Options
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newAddedOption}
              onChange={(e) => setNewAddedOption(e.target.value)}
              placeholder="Add option"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addOption}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {addedOptions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {addedOptions.map((option, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{option}</span>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        
        {/* Image Upload Section (Placeholder) */}
        <div className="mb-6 border border-gray-300 rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">Images</h3>
          <p className="text-sm text-gray-600 mb-4">
            Note: Image upload will be implemented separately. Images should be uploaded to:
            <br />
            <code className="bg-gray-100 px-2 py-1 rounded">/public/car{car?.id?.replace(/\D/g, '') || '[id]'}/pov1.jpg</code> through <code className="bg-gray-100 px-2 py-1 rounded">pov11.jpg</code>
          </p>
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
                // Reload the page to show updated images
                window.location.reload();
              }}
              carType="buy"
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
            {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Car' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}