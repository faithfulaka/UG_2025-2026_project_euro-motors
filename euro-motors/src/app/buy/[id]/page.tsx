'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarDetailSlideshow from '@/components/ui/CarDetailSlideshow';
import TermSlider from '@/components/ui/TermSlider';
import { Car } from '@/types';

export default function CarDetailsPage() {
  const params = useParams();
  const carId = params?.id as string;
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('specifications'); 
  const [cashDeposit, setCashDeposit] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');
  const [canInputMonthly, setCanInputMonthly] = useState<boolean>(false);
  const [termMonths, setTermMonths] = useState<number>(12);

  useEffect(() => {
    const fetchCarData = async () => {
      if (carId) {
        try {
          const response = await fetch(`/api/cars/${carId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch car data');
          }
          const data = await response.json();
          setCar(data);
          setLoading(false);
        } catch (error) {
          // Use error here instead of defining a separate err variable
          setError('Error fetching car details');
          setLoading(false);
        }
      }
    };
    
    fetchCarData();
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
                       {car.features.interior.map((feature: string, index: number) => (
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
                      {car.features.exterior.map((feature: string, index: number) => (
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
