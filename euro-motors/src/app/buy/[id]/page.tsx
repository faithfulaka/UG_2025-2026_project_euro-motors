'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CarSlideshow from '@/components/ui/CarSlideshow';

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [activeSection, setActiveSection] = useState('features');

  useEffect(() => {
    async function fetchCarDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/cars/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }
        const data = await response.json();
        setCar(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An error occurred while fetching car details');
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      // In a real app, you would fetch data from API
      // fetchCarDetails();
      
      // For demo purposes, use mock data
      const mockCar = getMockCarById(id as string);
      if (mockCar) {
        setCar(mockCar);
        setLoading(false);
      } else {
        setError('Car not found');
        setLoading(false);
      }
    }
  }, [id]);

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
          <div className="relative h-[500px]">
            <CarSlideshow 
              carId={car.id} 
              make={car.make} 
              model={car.model} 
            />
          </div>

          {/* Car basic information */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
                <p className="text-lg text-gray-600 mt-1">Model: {car.trim || car.model}</p>
                <p className="text-lg text-gray-600">Year: {car.year} {car.isNew ? '(Brand new)' : ''}</p>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600 mr-4">Birmingham</span>
                  
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    <span className="text-gray-600">Home delivery available</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-3xl font-bold">£{car.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 6l3 4h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1l3-4h10z"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Body Type</p>
              <p className="font-semibold">{car.bodyType}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M7 12h10"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Transmission</p>
              <p className="font-semibold">{car.transmission}</p>
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
              <p className="text-sm text-gray-500">Horse Power</p>
              <p className="font-semibold">{car.horsePower}hp</p>
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
              <p className="text-sm text-gray-500">Engine</p>
              <p className="font-semibold">{car.engine}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-7h-2c0-1-.5-1.5-1-2h0z"></path>
                  <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                  <path d="M16 19h2a2 2 0 002-2v-3"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Mileage</p>
              <p className="font-semibold">{car.mileage.toLocaleString()} miles</p>
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
              <p className="text-sm text-gray-500">Fuel Type</p>
              <p className="font-semibold">{car.fuelType}</p>
            </div>
          </div>
        </div>

        {/* Payment options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">How would you like to pay?</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="px-6 py-3 border border-gray-800 rounded-md font-medium hover:bg-gray-100">Cash</button>
            <button className="px-6 py-3 border border-gray-800 rounded-md font-medium hover:bg-gray-100">Finance</button>
            <button className="px-6 py-3 border border-gray-800 rounded-md font-medium hover:bg-gray-100 bg-gray-50">Trade in</button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="bg-gray-50 border border-gray-300 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-gray-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-gray-500">Cash Deposit</div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 border border-gray-300 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="text-gray-500 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-gray-500">Monthly Payment</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Term:</div>
                <div className="font-semibold">12 Months</div>
              </div>
              
              <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
                <div className="absolute h-1.5 bg-gray-200 rounded-full" style={{width: '50%'}}></div>
                <div className="absolute w-5 h-5 bg-red-600 rounded-full -mt-1.5" style={{left: '50%'}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="font-medium">Annual Mileage:</div>
                <div className="font-semibold">1000 Miles</div>
              </div>
              
              <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
                <div className="absolute h-1.5 bg-red-600 rounded-full" style={{width: '70%'}}></div>
                <div className="absolute w-5 h-5 bg-red-600 rounded-full -mt-1.5" style={{left: '70%'}}></div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800">
                Get a Quote
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button 
              onClick={() => setActiveSection('features')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'features' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700'}`}
            >
              Features
            </button>
            <button 
              onClick={() => setActiveSection('equipment')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'equipment' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700'}`}
            >
              Standard Equipment
            </button>
            <button 
              onClick={() => setActiveSection('options')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'options' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700'}`}
            >
              Added Options
            </button>
            <button 
              onClick={() => setActiveSection('suspension')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'suspension' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700'}`}
            >
              Engine/Drivetrain/Suspension
            </button>
            <button 
              onClick={() => setActiveSection('finance')} 
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeSection === 'finance' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700'}`}
            >
              Finance Example
            </button>
          </div>

          <div className="p-6">
            {activeSection === 'features' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Drive Type:</div>
                    <div>{car.driveType || 'All Wheel Drive'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Steering Type:</div>
                    <div>{car.steeringType || 'Left Hand Drive (LHD)'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Exterior Colour:</div>
                    <div>{car.color}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Interior Colour:</div>
                    <div>{car.interiorColor || 'Red/Black'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Doors:</div>
                    <div>{car.doors || '4'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Seats:</div>
                    <div>{car.seats || '5'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Wheels:</div>
                    <div>{car.wheelSize || '22 Inch Ten Spoke'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Brake Calipers:</div>
                    <div>{car.brakeColor || 'Red'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">DRY WEIGHT:</div>
                    <div>{car.weight || '2410 KG'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">WHEELBASE:</div>
                    <div>{car.wheelbase || '2.995 M'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">MAXIMUM TORQUE:</div>
                    <div>{car.torque || '770 NM'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">MAXIMUM SPEED:</div>
                    <div>{car.topSpeed || '290 KM/H'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">0-100 KM/H:</div>
                    <div>{car.acceleration100 || 'APPROXIMATELY 4.0 S'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">0-60KM/H:</div>
                    <div>{car.acceleration60 || 'APPROXIMATELY 1.9 S'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Power (kW):</div>
                    <div>{car.powerKW || '404 kW'}</div>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <div className="font-bold text-lg">Power (PS):</div>
                    <div>{car.powerPS || '549 PS'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'equipment' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Standard Equipment</h2>
                
                <h3 className="text-xl font-bold mb-4">Driver Convenience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-200 py-4 px-3">
                    Engine start/stop button
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Bentley Online services
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Bentley Teleservices
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Brake force display
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Digital Radio
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Oil level indicator
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Bentley Rear Entertainment
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    On board diagnostics
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Temperature Display
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Hands Free Tailgate
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'options' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Added Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-gray-200 py-4 px-3">
                    Touring Specification
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Embroidered Bentley Emblems
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Bentley Dynamic Ride
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Gloss Black Matrix Style Grille to Lower Bumper Apertures
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Five Seat Comfort Specification
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Heated, Acoustic, IR Front Screen
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Sports Exhaust
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Jewel Fuel Filler Cap
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Naim For Bentley
                  </div>
                  <div className="border-b border-gray-200 py-4 px-3">
                    Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'suspension' && (
              <div>
                <h2 className="text-2xl font-bold mb-8">Engine/Drivetrain/Suspension</h2>
                
                <div className="border-b border-gray-200 py-4 px-3">
                  Drive Performance Control
                </div>
              </div>
            )}

            {activeSection === 'finance' && (
              <div>
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

// Mock data function
function getMockCarById(id: string) {
  const mockCars = [
    {
      id: '1',
      make: 'Bentley',
      model: 'Bentayga V8',
      trim: 'BLACK EDITION',
      year: 2022,
      isNew: true,
      color: 'Pearl White',
      interiorColor: 'Red/Black',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 169990,
      engine: '6.0 L V8 Biturbo',
      horsePower: 542,
      torque: '770 NM',
      topSpeed: '290 KM/H',
      acceleration100: 'APPROXIMATELY 4.0 S',
      acceleration60: 'APPROXIMATELY 1.9 S',
      bodyType: 'SUV',
      driveType: 'All Wheel Drive',
      seats: 5,
      doors: 4,
      wheelSize: '22 Inch Ten Spoke',
      brakeColor: 'Red',
      weight: '2410 KG',
      wheelbase: '2.995 M',
      powerKW: '404 kW',
      powerPS: '549 PS',
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
        'Hands Free Tailgate'
      ],
      addedOptions: [
        'Touring Specification',
        'Bentley Dynamic Ride',
        'Five Seat Comfort Specification',
        'Sports Exhaust',
        'Naim For Bentley',
        'Embroidered Bentley Emblems',
        'Heated, Acoustic, IR Front Screen',
        'Jewel Fuel Filler Cap',
        'Heated, Duo Tone, 3 Spoke, Hide Trimmed Steering Wheel',
        'Deep Pile Overmats to Front and Rear'
      ],
      mainImage: '/images/gallery/component5.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Bentley Bentayga V8 BLACK EDITION offers an unparalleled luxury SUV experience with its powerful 6.0L V8 Biturbo engine, delivering 542 horsepower and a top speed of 290 km/h. This brand new 2022 model features pearl white exterior with a striking red/black interior and comes with premium options including the Touring Specification and Naim audio system.'
    },
    {
      id: '2',
      make: 'Rolls Royce',
      model: 'Cullinan V12',
      trim: 'BLACK BADGE',
      year: 2022,
      isNew: true,
      color: 'Dark Grey',
      interiorColor: 'Black',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 380000,
      engine: '6.75L V12',
      horsePower: 591,
      torque: '900 NM',
      topSpeed: '250 KM/H',
      acceleration100: 'APPROXIMATELY 4.9 S',
      bodyType: 'SUV',
      driveType: 'All Wheel Drive',
      seats: 5,
      doors: 4,
      wheelSize: '22 Inch Forged Alloy',
      brakeColor: 'Black',
      weight: '2753 KG',
      wheelbase: '3.295 M',
      powerKW: '441 kW',
      powerPS: '591 PS',
      standardEquipment: [
        'Engine start/stop button',
        'Rolls-Royce Connect',
        'Satellite Navigation',
        'Head-up Display',
        'Digital Radio',
        'Oil level indicator',
        'Rear Entertainment System',
        'On board diagnostics',
        'Temperature Display',
        'Hands Free Tailgate'
      ],
      addedOptions: [
        'Bespoke Audio System',
        'Dynamic Package',
        'Viewing Suite',
        'Starlight Headliner',
        'Night Vision',
        'Black Badge Styling Package',
        'Heated & Ventilated Seats',
        'Panoramic Glass Roof',
        'Illuminated Treadplates',
        'Deep Pile Carpets'
      ],
      mainImage: '/images/gallery/component4.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Rolls-Royce Cullinan Black Badge offers unprecedented luxury in the SUV market. With a potent 6.75L V12 engine, this commanding vehicle delivers 591 horsepower and is finished in stunning Dark Grey with black interior detailing. The Black Badge edition includes distinctive styling elements and enhanced performance features.'
    },
    {
      id: '3',
      make: 'Bentley',
      model: 'Continental GT V8',
      trim: 'Continental GT V8',
      year: 2022,
      isNew: true,
      color: 'Blue',
      interiorColor: 'Cream',
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      price: 175000,
      engine: '4.0L V8 Twin-Turbo',
      horsePower: 542,
      torque: '770 NM',
      topSpeed: '318 KM/H',
      acceleration100: 'APPROXIMATELY 3.9 S',
      bodyType: 'Coupe',
      driveType: 'All Wheel Drive',
      seats: 4,
      doors: 2,
      wheelSize: '21 Inch Five-Spoke',
      brakeColor: 'Red',
      weight: '2165 KG',
      wheelbase: '2.851 M',
      powerKW: '404 kW',
      powerPS: '542 PS',
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
        'Adaptive Cruise Control'
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
        'Deep Pile Overmats'
      ],
      mainImage: '/images/gallery/component6.jpg',
      features: {
        interior: ['Leather Seats', 'Climate Control', 'Navigation System'],
        exterior: ['Alloy Wheels', 'LED Headlights', 'Parking Sensors'],
        safety: ['ABS', 'Airbags', 'Traction Control']
      },
      description: 'The Bentley Continental GT V8 is the perfect grand tourer, combining breathtaking performance with exquisite luxury and cutting-edge technology. This 2022 model features a stunning blue exterior finish and a cream leather interior, delivering an unmatched driving experience with its powerful 4.0L V8 Twin-Turbo engine and sophisticated all-wheel drive system.'
    }
  ];
  
  return mockCars.find(car => car.id === id);
}