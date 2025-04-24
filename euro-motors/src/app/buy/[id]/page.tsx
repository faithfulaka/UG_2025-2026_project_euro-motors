'use client';

import { useState, useEffect, JSX } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarDetailSlideshow from '@/components/ui/CarDetailSlideshow';
import TermSlider from '@/components/ui/TermSlider';


interface Car {
    id: string;
    make: string;
    model: string;
    trim?: string;
    year: number;
    price: number; // This will be the average dealer price from scraper
    
    // Enhanced specifications from scraper data
    specifications: {
      // Basic info
      color: string;
      interiorColor: string;
      mileage: number;
      colorOptions?: number; // Number of standard color options available
      
      // Powertrain
      engine: string;
      horsePower: number;
      torque: string;
      fuelType: string;
      transmission: string;
      driveType: string;
      fuelEconomy?: string; // Added from scraper data
      
      // Performance
      topSpeed: string;
      acceleration100: string;
      acceleration60?: string;
      powerKW: string;
      powerPS: string;
      powerRPM?: string; // RPM at which max power is achieved
      torqueRange?: string; // RPM range for max torque
      
      // Dimensions
      bodyType: string;
      seats: number;
      doors: number;
      weight: string;
      wheelbase: string;
      
      // Additional specs
      wheelSize: string;
      brakeColor: string;
      steeringType?: string;
    };
    
    features: {
      interior: string[];
      exterior: string[];
      safety: string[];
    };
    
    standardEquipment: string[];
    addedOptions: string[];
    
    mainImage: string;
    description: string;
  }

export default function CarDetailsPage(): JSX.Element {
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showTradeInModal, setShowTradeInModal] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('specifications'); 
  const [cashDeposit, setCashDeposit] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [canInputMonthly, setCanInputMonthly] = useState<boolean>(false);
  const [termMonths, setTermMonths] = useState<number>(12);
  
  
  // Functions to validate and handle numeric input
  const handleCashDepositChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Allow only numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setCashDeposit(value);
    setCanInputMonthly(value.length > 0);
  };
  
  const handleMonthlyPaymentChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Allow only numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setMonthlyPayment(value);
  };
 
  useEffect(() => {

    if (carId) {
      // In a real app, you would fetch data from API
      // fetchCarDetails();
      
      // For demo purposes, use mock data
      const mockCar = getMockCarById(carId);
      if (mockCar) {
        setCar(mockCar);
        setLoading(false);
      } else {
        setError('Car not found');
        setLoading(false);
      }
    }
  }, [carId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Car not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <Link href="/buy" className="text-red-600 hover:text-red-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Listings
          </Link>
        </div>

        {/* Car header with slideshow */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative h-[650px] w-full">
            <CarDetailSlideshow
              carId={car.id} 
              make={car.make} 
              model={car.model} 
            />
          </div>

          {/* Car basic information */}
          <div className="p-6 border-b border-black text-black ">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
                <p className="text-lg text-black mt-1">Model: {car.trim || car.model}</p>
                <p className="text-lg text-black">Year: {car.year}</p>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-black mr-4">Leicester</span>
                  
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    <span className="text-black">Home delivery available</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-3xl font-bold">£{car.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 border-b border-black text-black ">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 6l3 4h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1l3-4h10z"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              </div>
              <p className="text-sm text-black">Body Type</p>
              <p className="font-semibold">{car.specifications.bodyType}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M7 12h10"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Transmission</p>
              <p className="font-semibold">{car.specifications.transmission}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                  <path d="M9 17h6"></path>
                  <path d="M9 13h6"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Horse Power</p>
              <p className="font-semibold">{car.specifications.horsePower}hp</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M14.31 8l5.74 9.94"></path>
                  <path d="M9.69 8h10.61"></path>
                  <path d="M7.38 12l5.74-9.94"></path>
                  <path d="M7.38 12l5.74 9.94"></path>
                  <path d="M3.95 17.94l11.47-5.94"></path>
                  <path d="M3.95 6.06l11.47 5.94"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Engine</p>
              <p className="font-semibold">{car.specifications.engine}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-7h-2c0-1-.5-1.5-1-2h0z"></path>
                  <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                  <path d="M16 19h2a2 2 0 002-2v-3"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Mileage</p>
              <p className="font-semibold">{car.specifications.mileage.toLocaleString()} miles</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 11h.01"></path>
                  <path d="M11 15h.01"></path>
                  <path d="M16 16h.01"></path>
                  <path d="M2 9a4 4 0 014-4h12a4 4 0 014 4v6a4 4 0 01-4 4H6a4 4 0 01-4-4V9z"></path>
                </svg>
              </div>
              <p className="text-sm text-black">Fuel Type</p>
              <p className="font-semibold">{car.specifications.fuelType}</p>
            </div>
          </div>
        </div>

        {/* Payment options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-black">
          <h2 className="text-2xl font-bold mb-4">How would you like to pay?</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="px-6 py-3 border border-black rounded-md font-medium hover:bg-gray-200  hover:text-black ">Trade in</button>
            <button className="px-6 py-3 border border-black rounded-md font-medium hover:bg-gray-200  hover:text-black ">Cash</button>
            <button className="px-6 py-3 border border-black rounded-md font-medium hover:bg-gray-200  hover:text-black ">Finance</button>    
          </div>

          <div className="space-y-6">
            <div>
              <div className="bg-gray-50 border border-black p-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-black mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={cashDeposit} 
                    onChange={handleCashDepositChange} 
                    className="flex-1 w-full bg-transparent border-none outline-none text-black placeholder-black"
                    placeholder="Cash Deposit"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 border border-black p-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-black mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={monthlyPayment} 
                    onChange={handleMonthlyPaymentChange} 
                    className="flex-1 w-full bg-transparent border-none outline-none text-black placeholder-black"
                    placeholder="Monthly Payment"
                    disabled={!canInputMonthly}
                  />
                </div>
              </div>
            </div>
  
            <TermSlider termMonths={termMonths} setTermMonths={setTermMonths} />

            <div className="flex justify-center mt-8">
              <button className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800">
                Get a Quote
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-black overflow-x-auto">
          <button 
             onClick={() => setActiveSection('specifications')} 
             className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'specifications' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Specifications
            </button>

            <button 
              onClick={() => setActiveSection('features')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'features' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Features
            </button>

            <button 
              onClick={() => setActiveSection('equipment')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'equipment' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Standard Equipment
            </button>

            <button 
              onClick={() => setActiveSection('options')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'options' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Added Options
            </button>
            
            <button 
              onClick={() => setActiveSection('finance')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'finance' ? 'text-red-600 border-b-2 border-red-600' : 'text-black'}`}
            >
              Finance Example
            </button>
          </div>

          <div className="p-6">
            {activeSection === 'specifications' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Specifications</h2>
                    
                {/* Basic Info */}
                <h3 className="text-xl font-semibold mb-4 border-b border-black pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Exterior Colour:</div>
                    <div>{car.specifications.color}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Interior Colour:</div>
                    <div>{car.specifications.interiorColor}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Mileage:</div>
                    <div>{car.specifications.mileage.toLocaleString()} miles</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Steering Type:</div>
                    <div>{car.specifications.steeringType || 'Left Hand Drive (LHD)'}</div>
                  </div>
                  {car.specifications.colorOptions && (
                    <div className="border-b border-black pb-3">
                      <div className="font-bold text-lg">Standard Color Options:</div>
                      <div>{car.specifications.colorOptions}</div>
                    </div>
                  )}
                </div>
              
                {/* Powertrain */}
                <h3 className="text-xl font-semibold mb-4 border-b border-black pb-2">Powertrain</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Engine:</div>
                    <div>{car.specifications.engine}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Horsepower:</div>
                    <div>{car.specifications.horsePower} HP {car.specifications.powerRPM ? `@ ${car.specifications.powerRPM}` : ''}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Torque:</div>
                    <div>{car.specifications.torque} {car.specifications.torqueRange ? `@ ${car.specifications.torqueRange}` : ''}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Transmission:</div>
                    <div>{car.specifications.transmission}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Fuel Type:</div>
                    <div>{car.specifications.fuelType}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Drive Type:</div>
                    <div>{car.specifications.driveType}</div>
                  </div>
                  {car.specifications.fuelEconomy && (
                    <div className="border-b border-black pb-3">
                      <div className="font-bold text-lg">Fuel Economy:</div>
                      <div>{car.specifications.fuelEconomy}</div>
                    </div>
                  )}
                </div>
              
                {/* Performance */}
                <h3 className="text-xl font-semibold mb-4 border-b border-black pb-2">Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Top Speed:</div>
                    <div>{car.specifications.topSpeed}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">0-100 KM/H:</div>
                    <div>{car.specifications.acceleration100}</div>
                  </div>
                  {car.specifications.acceleration60 && (
                    <div className="border-b border-black pb-3">
                      <div className="font-bold text-lg">0-60 KM/H:</div>
                      <div>{car.specifications.acceleration60}</div>
                    </div>
                  )}
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Power (kW):</div>
                    <div>{car.specifications.powerKW}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Power (PS):</div>
                    <div>{car.specifications.powerPS}</div>
                  </div>
                </div>
              
                {/* Dimensions */}
                <h3 className="text-xl font-semibold mb-4 border-b border-black pb-2">Dimensions & Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Body Type:</div>
                    <div>{car.specifications.bodyType}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Doors:</div>
                    <div>{car.specifications.doors}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Seats:</div>
                    <div>{car.specifications.seats}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Weight:</div>
                    <div>{car.specifications.weight}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Wheelbase:</div>
                    <div>{car.specifications.wheelbase}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Wheels:</div>
                    <div>{car.specifications.wheelSize}</div>
                  </div>
                  <div className="border-b border-black pb-3">
                    <div className="font-bold text-lg">Brake Calipers:</div>
                    <div>{car.specifications.brakeColor}</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'features' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Features</h2>

                {/* Features Description - using the car's main description */}
                <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 border-b border-black pb-2">Features Overview</h3>
                  <p className="text-black leading-relaxed">
                    {car.description}
                  </p>
                </div>

                {/* Feature Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Interior Features */}
                  <div>
                    <h3 className="text-xl font-semibold border-b border-black pb-2 mb-4">Interior Features</h3>
                    <ul className="space-y-3">
                      {car.features.interior.map((feature, index) => (
                        <li key={`interior-${index}`} className="flex items-start">
                          <span className="text-red-600 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="text-black">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Exterior Features */}
                  <div>
                    <h3 className="text-xl font-semibold border-b border-black pb-2 mb-4">Exterior Features</h3>
                    <ul className="space-y-3">
                      {car.features.exterior.map((feature, index) => (
                        <li key={`exterior-${index}`} className="flex items-start">
                          <span className="text-red-600 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="text-black">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Safety Features */}
                  <div>
                    <h3 className="text-xl font-semibold border-b border-black pb-2 mb-4">Safety Features</h3>
                    <ul className="space-y-3">
                      {car.features.safety.map((feature, index) => (
                        <li key={`safety-${index}`} className="flex items-start">
                          <span className="text-red-600 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="text-black">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}


            {activeSection === 'equipment' && (
              <div className="text-black">
                <h2 className="text-2xl font-bold mb-8">Standard Equipment</h2>
                
                <h3 className="text-xl font-bold mb-4">Driver Convenience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-black py-4 px-3">
                    Engine start/stop button
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Online services
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Teleservices
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Brake force display
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Digital Radio
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Oil level indicator
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Rear Entertainment
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    On board diagnostics
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Temperature Display
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Hands Free Tailgate
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'options' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Added Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-black py-4 px-3">
                    Touring Specification
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Embroidered Bentley Emblems
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Bentley Dynamic Ride
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Gloss Black Matrix Style Grille to Lower Bumper Apertures
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Five Seat Comfort Specification
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Heated, Acoustic, IR Front Screen
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Sports Exhaust
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Jewel Fuel Filler Cap
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Naim For Bentley
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Mood Lighting
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Comfort Headrests to Rear Outer Seats
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    LED Welcome Lamps
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Deep Pile Overmats to Front and Rear
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Top View Camera
                  </div>
                  <div className="border-b border-black py-4 px-3">
                    Electrically Operated Blinds for Rear Side Windows
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'finance' && (
              <div className="text-black">
                <h2 className="text-2xl font-bold mb-6">Representative Example</h2>
                
                <div className="space-y-0.5 mb-8">
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>48 monthly payments of</div>
                    <div>£2,387.62</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Total Price</div>
                    <div>£169,990.00</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Cash deposit</div>
                    <div>£34,824.10</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Customer total deposit</div>
                    <div>£34,824.10</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Amount of credit</div>
                    <div>£135,165.90</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Optional final payment</div>
                    <div>£63,641.00</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Total amount payable</div>
                    <div>£213,080.86</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>Duration of agreement</div>
                    <div>49 months</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-600 bg-opacity-90 px-4 py-2 text-black">
                    <div>Fixed interest rate</div>
                    <div>10.39% p.a.</div>
                  </div>
                  <div className="flex justify-between items-center bg-red-200 bg-opacity-90 px-4 py-2 text-black">
                    <div>APR (%)</div>
                    <div>10.9% APR</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
                <p className="text-sm mb-8">
                  We are a credit broker, not a lender or an independent financial advisor. We can introduce you to a limited number of lenders & their finance products which may have different interest rates & charges. We may advise you on the products, subject to your personal circumstances, though you are not obliged to take our advice or recommendation. We do not charge you a fee. Whichever lender we introduce you to, we will receive commission from them (either a fixed fee or a fixed percentage of the amount you borrow). The lenders we work with could pay us commission at different rates. The amount of commission we receive does not affect the amount that you pay under your credit agreement. Finance subject to status. Guarantees may be required.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockCarById(id: string): Car | null {
    const mockCars: Car[] = [
      {
        id: '1',
        make: 'Bentley',
        model: 'Bentayga V8',
        trim: 'BLACK EDITION',
        year: 2022,
        price: 169990, // Average dealer price directly
        
        specifications: {
          color: 'Pearl White',
          interiorColor: 'Red/Black',
          mileage: 0,
          colorOptions:3, // From scraper data
          
          engine: '6.0 L V8 Biturbo',
          horsePower: 542,
          torque: '770 NM',
          fuelType: 'Petrol',
          transmission: 'Automatic',
          driveType: 'All Wheel Drive',
          fuelEconomy: '21.7 mpg combined', // From scraper data
          
          topSpeed: '290 KM/H',
          acceleration100: 'APPROXIMATELY 4.0 S',
          acceleration60: 'APPROXIMATELY 1.9 S',
          powerKW: '404 kW',
          powerPS: '549 PS',
          powerRPM: '6,000 rpm', // From scraper data
          torqueRange: '1,960-4,500 rpm', // From scraper data
          
          bodyType: 'SUV',
          seats: 5,
          doors: 4,
          weight: '2410 KG',
          wheelbase: '2.995 M',
          
          wheelSize: '22 Inch Ten Spoke',
          brakeColor: 'Red',
          steeringType: 'Left Hand Drive (LHD)',
        },
        
        features: {
          interior: ['Leather Seats', 'Climate Control', 'Navigation System', 'Heated Seats', 'Ventilated Seats', 'Panoramic Roof'],
          exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors', 'Power Tailgate', 'Roof Rails', 'Privacy Glass'],
          safety: ['ABS', 'Airbags', 'Traction Control', 'Lane Departure Warning', 'Blind Spot Monitor', 'Adaptive Cruise Control'],
        },
        
        standardEquipment: [
          'Engine start/stop button',
          'Bentley Online services',
          'Bentley Teleservices',
          'Brake force display',
          'Digital Radio',
          'Oil level indicator',
          'Bentley Rear Entertainment',
          'On board diagnostics',
          'Temperature Display',
          'Hands Free Tailgate',
        ],
        
        addedOptions: [
          'Touring Specification',
          'Embroidered Bentley Emblems',
          'Bentley Dynamic Ride',
          'Gloss Black Matrix Style Grille to Lower Bumper Apertures',
          'Five Seat Comfort Specification',
          'Heated, Acoustic, IR Front Screen',
          'Sports Exhaust',
          'Jewel Fuel Filler Cap',
          'Naim For Bentley',
          'Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel',
          'Mood Lighting',
          'Comfort Headrests to Rear Outer Seats',
          'LED Welcome Lamps',
          'Deep Pile Overmats to Front and Rear',
          'Top View Camera',
          'Electrically Operated Blinds for Rear Side Windows'
        ],
        
        mainImage: '/images/gallery/component5.jpg',
        description: 'The Bentley Bentayga V8 BLACK EDITION offers an unparalleled luxury SUV experience with its powerful 6.0L V8 Biturbo engine, delivering 542 horsepower and a top speed of 290 km/h. This brand new 2022 model features pearl white exterior with a striking red/black interior and comes with premium options including the Touring Specification and Naim audio system.',
      },
      {
        id: '2',
        make: 'Rolls Royce',
        model: 'Cullinan V12',
        trim: 'BLACK BADGE',
        year: 2022,
        price: 380000, // Average dealer price directly
        
        specifications: {
          color: 'Dark Grey',
          interiorColor: 'Black',
          mileage: 0,
          colorOptions: 20, // From scraper data
          
          engine: '6.75L V12',
          horsePower: 591,
          torque: '900 NM',
          fuelType: 'Petrol',
          transmission: 'Automatic',
          driveType: 'All Wheel Drive',
          fuelEconomy: '18.8 mpg combined', // From scraper data
          
          topSpeed: '250 KM/H (limited)',
          acceleration100: 'APPROXIMATELY 4.9 S',
          acceleration60: 'APPROXIMATELY 2.5 S',
          powerKW: '441 kW',
          powerPS: '600 PS',
          powerRPM: '5,250 rpm', // From scraper data
          torqueRange: '1,700-4,500 rpm', // From scraper data
          
          bodyType: 'SUV',
          seats: 5,
          doors: 4,
          weight: '2660 KG',
          wheelbase: '3.295 M',
          
          wheelSize: '22 Inch Black Alloy',
          brakeColor: 'Black',
          steeringType: 'Right Hand Drive (RHD)',
        },
        
        features: {
          interior: ['Hand-Crafted Leather', 'Starlight Headliner', 'Bespoke Audio System', 'Refrigerator', 'Champagne Cooler', 'Lambswool Floor Mats'],
          exterior: ['Pantheon Grille', 'Coach Doors', 'Illuminated Front Grille', 'Electric Retracting Spirit of Ecstasy', 'Self-leveling Wheel Centers', 'Bespoke Paint Finish'],
          safety: ['Night Vision', 'Wildlife & Pedestrian Warning', 'Active Cruise Control', 'Collision Mitigation', 'Traffic Sign Recognition', 'Driver Alertness Monitoring'],
        },
        
        standardEquipment: [
          'Satellite Aided Transmission',
          'Rolls-Royce Connect',
          'Panoramic Glass Sunroof',
          'Head-Up Display',
          'Wifi Hotspot',
          'Bespoke Clock',
          'Spirit of Ecstasy Rotary Controller',
          'Automatic Climate Control',
          'Air Purification System',
          'Rear Theatre Configuration',
        ],
        
        addedOptions: [
          'Black Badge Styling Package',
          'Technical Fibre Trim',
          'Contrast Stitching',
          'Bespoke Interior Package',
          'Extended Leather Headliner',
          'Shooting Star Headliner',
          'Night Vision Enhancement',
          'Bespoke Audio System',
          'Rear Entertainment System',
          'Drink Cabinet with Whisky Glasses',
          'Refrigerator Compartment',
          'Lambswool Floor Mats',
          'Umbrellas in Rear Door Storage',
          'Bespoke Luggage Set',
          'Rear Privacy Glass',
          'Illuminated Treadplates'
        ],
        
        mainImage: '/images/gallery/component4.jpg',
        description: 'The Rolls-Royce Cullinan BLACK BADGE represents the pinnacle of luxury SUVs. With its powerful 6.75L V12 engine, this vehicle delivers effortless performance with 591 horsepower and sophisticated all-wheel drive. The 2022 model features dark grey exterior with black accent details and a hand-crafted interior that sets new standards for luxury and comfort.',
      },
      {
        id: '3',
        make: 'Bentley',
        model: 'Continental GT V8',
        trim: 'Continental GT V8',
        year: 2022,
        price: 174995, // Average dealer price directly
        
        specifications: {
          color: 'Blue',
          interiorColor: 'Cream',
          mileage: 0,
          colorOptions: 16, // From scraper data
          
          engine: '4.0L V8 Twin-Turbo',
          horsePower: 542,
          torque: '770 NM',
          fuelType: 'Petrol',
          transmission: '8-speed dual-clutch', // Updated from scraper data
          driveType: 'All Wheel Drive',
          fuelEconomy: '23.3 mpg combined', // From scraper data
          
          topSpeed: '318 KM/H',
          acceleration100: 'APPROXIMATELY 3.9 S',
          acceleration60: 'APPROXIMATELY 1.8 S',
          powerKW: '404 kW',
          powerPS: '542 PS',
          powerRPM: '6,000 rpm', // From scraper data
          torqueRange: '1,960-4,500 rpm', // From scraper data
          
          bodyType: 'Coupe',
          seats: 4,
          doors: 2,
          weight: '2165 KG',
          wheelbase: '2.851 M',
          
          wheelSize: '21 Inch Five-Spoke',
          brakeColor: 'Red',
          steeringType: 'Left Hand Drive (LHD)',
        },
        
        features: {
          interior: ['Leather Seats', 'Rotating Display', 'Panoramic Roof', 'Digital Dashboard', 'Ambient Lighting', 'Diamond Quilted Upholstery'],
          exterior: ['Matrix LED Headlamps', 'Chrome Grille', 'Power Boot', 'Active Rear Spoiler', 'Elliptical Tail Lamps', 'Sports Exhaust'],
          safety: ['360-degree Camera', 'Night Vision', 'Lane Assist', 'Traffic Sign Recognition', 'Pre-sense Safety System', 'Adaptive Cruise Control'],
        },
        
        standardEquipment: [
          'Engine start/stop button',
          'Bentley Online services',
          'Bentley Teleservices',
          'Brake force display',
          'Digital Radio',
          'Oil level indicator',
          'Bentley Rear Entertainment',
          'On board diagnostics',
          'Temperature Display',
          'Adaptive Cruise Control',
        ],
        
        addedOptions: [
          'Touring Specification',
          'Bentley Dynamic Ride',
          'Sports Exhaust',
          'Naim For Bentley',
          'Rotating Display',
          'Mood Lighting',
          'City Specification',
          'Front Seat Comfort Specification',
          'Contrast Stitching',
          'Deep Pile Overmats',
          'LED Welcome Lamps',
          'Heated 3-Spoke Steering Wheel',
          'Bentley Signature Audio',
          'Carbon Ceramic Brakes',
          'Blackline Specification',
          'Illuminated Door Sills'
        ],
        
        mainImage: '/images/gallery/component6.jpg',
        description: 'The Bentley Continental GT V8 is the perfect grand tourer, combining breathtaking performance with exquisite luxury and cutting-edge technology. This 2022 model features a stunning blue exterior finish with a cream leather interior, delivering an unmatched driving experience with its powerful 4.0L V8 Twin-Turbo engine producing 542 horsepower.',
      }
    ];
    
    return mockCars.find((car) => car.id === id) || null;
  }