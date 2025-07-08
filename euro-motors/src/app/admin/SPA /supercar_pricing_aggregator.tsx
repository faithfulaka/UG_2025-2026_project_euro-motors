// src/app/admin/supercar_pricing_aggregator/page.tsx
'use client';

import { useState } from 'react';

interface SupercarData {
  // Basic Specifications
  make: string;
  model: string;
  year: number;
  bodyType: string;
  colourOptions: string;
  vinPattern: string;
  
  // Performance
  engine: string;
  horsepower: string;
  torque: string;
  acceleration060: string;
  topSpeed: string;
  transmission: string;
  driveType: string;
  weight: string;
  fuelEconomy: string;
  
  // Pricing Data
  baseMSRP: number;
  currentMarketRange: string;
  averageDealerPrice: number;
  dealerInventoryCount: number;
  priceTrend: string;
  
  // Auction History
  recentSales: string;
  averageAuctionPrice: number;
  highestSale: string;
  lowestSale: string;
  commonAuctionNotes: string[];
  
  // Popular Configurations
  basePrice: number;
  mostSelectedOptions: Array<{
    name: string;
    price: number;
  }>;
  mostPopularExteriorColor: string;
  mostPopularInterior: string;
  
  // Depreciation & Value
  depreciation: {
    year1: string;
    year3: string;
    year5: string;
  };
  residualValueRating: string;
  rareOptionsForResale: string[];
  
  // Dealer Data
  averageDaysOnMarket: number;
  currentUKInventory: number;
  mostCommonDealerAddOns: string[];
  
  // Competing Models
  primaryCompetitors: Array<{
    name: string;
    avgPrice: number;
  }>;
  pricePosition: string;
  
  // Warranty & Maintenance
  factoryWarranty: string;
  extendedOptions: string;
  estimatedAnnualMaintenance: string;
  commonServiceItems: Array<{
    item: string;
    cost: string;
  }>;
  
  // Ownership Costs
  insuranceGroup: number;
  annualRoadTax: number;
  typicalFinancing: string;
  fuelCost: string;
}

const mockSupercarData: SupercarData = {
  // Basic Specifications
  make: 'Bentley',
  model: 'Continental GT V8',
  year: 2022,
  bodyType: 'Coupe',
  colourOptions: '16 standard, 85+ bespoke options',
  vinPattern: 'SCBXX***CX***',
  
  // Performance
  engine: '4.0L V8 Twin-Turbo',
  horsepower: '542 hp @ 6,000 rpm',
  torque: '770 Nm @ 1,960-4,500 rpm',
  acceleration060: '3.9 seconds',
  topSpeed: '198 mph (318 km/h)',
  transmission: '8-speed dual-clutch',
  driveType: 'All-wheel drive',
  weight: '2,165 kg',
  fuelEconomy: '23.3 mpg combined',
  
  // Pricing Data
  baseMSRP: 175000,
  currentMarketRange: '£170,500 - £182,000',
  averageDealerPrice: 174995,
  dealerInventoryCount: 8,
  priceTrend: 'Stable (±1.5% last 30 days)',
  
  // Auction History
  recentSales: '5 in last 6 months',
  averageAuctionPrice: 155200,
  highestSale: '£168,500 (1,200 miles)',
  lowestSale: '£142,000 (12,500 miles)',
  commonAuctionNotes: ['Mulliner Driving Specification', 'First Edition'],
  
  // Popular Configurations
  basePrice: 175000,
  mostSelectedOptions: [
    { name: 'Touring Specification', price: 6500 },
    { name: 'Naim For Bentley Audio', price: 8800 },
    { name: 'City Specification', price: 4200 },
    { name: 'Rotating Display', price: 5100 },
    { name: 'Front Seat Comfort Specification', price: 3900 },
    { name: 'Contrast Stitching', price: 1800 }
  ],
  mostPopularExteriorColor: 'Glacier White',
  mostPopularInterior: 'Beluga/Linen two-tone',
  
  // Depreciation & Value
  depreciation: {
    year1: '-15% (Est. Value: £148,750)',
    year3: '-35% (Est. Value: £113,750)',
    year5: '-48% (Est. Value: £91,000)'
  },
  residualValueRating: 'Good (compared to segment)',
  rareOptionsForResale: ['Rotating Display', 'First Edition'],
  
  // Dealer Data
  averageDaysOnMarket: 42,
  currentUKInventory: 14,
  mostCommonDealerAddOns: ['Ceramic Coating', 'Extended Warranty'],
  
  // Competing Models
  primaryCompetitors: [
    { name: 'Aston Martin DB11', avgPrice: 159000 },
    { name: 'Ferrari Roma', avgPrice: 201000 },
    { name: 'McLaren GT', avgPrice: 169000 },
    { name: 'Porsche 911 Turbo', avgPrice: 155000 }
  ],
  pricePosition: 'Mid-range for the segment',
  
  // Warranty & Maintenance
  factoryWarranty: '3 years/unlimited mileage',
  extendedOptions: 'Up to 5 years available',
  estimatedAnnualMaintenance: '£3,500-£5,000',
  commonServiceItems: [
    { item: 'Brake pads', cost: '£1,800' },
    { item: 'Annual service', cost: '£1,200' }
  ],
  
  // Ownership Costs
  insuranceGroup: 50,
  annualRoadTax: 580,
  typicalFinancing: '4.9% APR (£3,120/month with 20% down, 48 months)',
  fuelCost: 'Approx. £4,200/year (10,000 miles)'
};

export default function SupercarPricingAggregatorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [supercarData, setSupercarData] = useState<SupercarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSupercarData(mockSupercarData);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚘 Supercar Pricing Aggregator</h1>
          <p className="text-gray-600">Get comprehensive data on luxury vehicles including pricing, performance, and market insights</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <select 
                value={selectedMake} 
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Make</option>
                <option value="bentley">Bentley</option>
                <option value="rolls-royce">Rolls Royce</option>
                <option value="ferrari">Ferrari</option>
                <option value="lamborghini">Lamborghini</option>
                <option value="mclaren">McLaren</option>
                <option value="aston-martin">Aston Martin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="e.g., Continental GT V8"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70"
              >
                {isLoading ? 'Searching...' : 'Get Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Comprehensive Data Display */}
        {supercarData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔍 COMPREHENSIVE DATA: {supercarData.make} {supercarData.model}
              </h2>
            </div>

            {/* Basic Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">=== BASIC SPECIFICATIONS ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong>Make:</strong> {supercarData.make}</div>
                <div><strong>Model:</strong> {supercarData.model}</div>
                <div><strong>Year:</strong> {supercarData.year}</div>
                <div><strong>Body Type:</strong> {supercarData.bodyType}</div>
                <div><strong>Colour Options:</strong> {supercarData.colourOptions}</div>
                <div><strong>VIN Pattern:</strong> {supercarData.vinPattern}</div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-600">=== PERFORMANCE ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong>Engine:</strong> {supercarData.engine}</div>
                <div><strong>Horsepower:</strong> {supercarData.horsepower}</div>
                <div><strong>Torque:</strong> {supercarData.torque}</div>
                <div><strong>0-60 mph:</strong> {supercarData.acceleration060}</div>
                <div><strong>Top Speed:</strong> {supercarData.topSpeed}</div>
                <div><strong>Transmission:</strong> {supercarData.transmission}</div>
                <div><strong>Drive Type:</strong> {supercarData.driveType}</div>
                <div><strong>Weight:</strong> {supercarData.weight}</div>
                <div><strong>Fuel Economy:</strong> {supercarData.fuelEconomy}</div>
              </div>
            </div>

            {/* Pricing Data */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-600">=== PRICING DATA ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong>Base MSRP:</strong> £{supercarData.baseMSRP.toLocaleString()}</div>
                <div><strong>Current Market Range:</strong> {supercarData.currentMarketRange}</div>
                <div><strong>Average Dealer Price:</strong> £{supercarData.averageDealerPrice.toLocaleString()}</div>
                <div><strong>Dealer Inventory Count:</strong> {supercarData.dealerInventoryCount} vehicles nationwide</div>
                <div><strong>Price Trend:</strong> {supercarData.priceTrend}</div>
              </div>
            </div>

            {/* Auction History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">=== AUCTION HISTORY ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Recent Sales:</strong> {supercarData.recentSales}</div>
                <div><strong>Average Auction Price:</strong> £{supercarData.averageAuctionPrice.toLocaleString()}</div>
                <div><strong>Highest Sale:</strong> {supercarData.highestSale}</div>
                <div><strong>Lowest Sale:</strong> {supercarData.lowestSale}</div>
                <div className="md:col-span-2">
                  <strong>Common Auction Notes:</strong> {supercarData.commonAuctionNotes.join(', ')}
                </div>
              </div>
            </div>

            {/* Popular Configurations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-600">=== POPULAR CONFIGURATIONS ===</h3>
              <div className="mb-4">
                <div><strong>Base Price:</strong> £{supercarData.basePrice.toLocaleString()}</div>
              </div>
              <div className="mb-4">
                <strong>Most Selected Options:</strong>
                <ul className="ml-4 mt-2">
                  {supercarData.mostSelectedOptions.map((option, index) => (
                    <li key={index}>- {option.name}: £{option.price.toLocaleString()}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Most Popular Exterior Color:</strong> {supercarData.mostPopularExteriorColor}</div>
                <div><strong>Most Popular Interior:</strong> {supercarData.mostPopularInterior}</div>
              </div>
            </div>

            {/* Depreciation & Value */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-600">=== DEPRECIATION & VALUE ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div><strong>Year 1:</strong> {supercarData.depreciation.year1}</div>
                <div><strong>Year 3:</strong> {supercarData.depreciation.year3}</div>
                <div><strong>Year 5:</strong> {supercarData.depreciation.year5}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Residual Value Rating:</strong> {supercarData.residualValueRating}</div>
                <div><strong>Rare Options That Improve Resale:</strong> {supercarData.rareOptionsForResale.join(', ')}</div>
              </div>
            </div>

            {/* Competing Models */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-600">=== COMPETING MODELS ===</h3>
              <div className="mb-4">
                <strong>Primary Competitors:</strong>
                <ul className="ml-4 mt-2">
                  {supercarData.primaryCompetitors.map((competitor, index) => (
                    <li key={index}>- {competitor.name} (Avg. Price: £{competitor.avgPrice.toLocaleString()})</li>
                  ))}
                </ul>
              </div>
              <div><strong>Price Position:</strong> {supercarData.pricePosition}</div>
            </div>

            {/* Ownership Costs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-pink-600">=== OWNERSHIP COSTS ===</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Insurance Group:</strong> {supercarData.insuranceGroup}</div>
                <div><strong>Annual Road Tax:</strong> £{supercarData.annualRoadTax} (luxury vehicle tax)</div>
                <div><strong>Typical Financing:</strong> {supercarData.typicalFinancing}</div>
                <div><strong>Fuel Cost:</strong> {supercarData.fuelCost}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}