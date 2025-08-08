// src/lib/services/new-apis/api-validator.ts - API Testing and Validation
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Test API connectivity and return detailed results
export async function validateAPIs(testParams = { make: 'BMW', model: 'X5', year: 2023 }) {
  const results = {
    timestamp: new Date().toISOString(),
    rapidApiKeyPresent: !!RAPIDAPI_KEY,
    rapidApiKey: RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 8)}...` : 'NOT SET',
    testParams,
    apis: {} as Record<string, any>
  };

  // Test Edmunds API
  results.apis.edmunds = await testEdmundsAPI(testParams);
  
  // Test MarketCheck API
  results.apis.marketcheck = await testMarketCheckAPI(testParams);
  
  // Test CIS Automotive API
  results.apis.cisAutomotive = await testCISAPI(testParams);
  
  // Test Car Data API
  results.apis.carData = await testCarDataAPI(testParams);

  // Test free alternatives
  results.apis.freeAlternatives = await testFreeAlternatives(testParams);

  return results;
}

async function testEdmundsAPI(params: any) {
  try {
    const response = await axios.get('https://community-edmunds.p.rapidapi.com/api/vehicle/v2/makes', {
      headers: {
        'x-rapidapi-host': 'community-edmunds.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY || '',
      },
      params: { fmt: 'json' },
      timeout: 5000
    });

    return {
      status: 'success',
      statusCode: response.status,
      dataStructure: typeof response.data,
      sampleKeys: Object.keys(response.data || {}).slice(0, 5),
      dataSize: JSON.stringify(response.data || {}).length,
      note: 'Edmunds API appears to work'
    };
  } catch (error: any) {
    return {
      status: 'failed',
      statusCode: error.response?.status || 0,
      error: error.message,
      errorCode: error.code,
      note: error.response?.status === 401 ? 'Invalid API key' : 
             error.response?.status === 429 ? 'Rate limit exceeded' :
             error.response?.status === 403 ? 'Access forbidden - may need subscription' :
             'Connection or other error'
    };
  }
}

async function testMarketCheckAPI(params: any) {
  try {
    const response = await axios.get('https://marketcheck-cars-search-v1.p.rapidapi.com/search', {
      headers: {
        'x-rapidapi-host': 'marketcheck-cars-search-v1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY || '',
      },
      params: { make: params.make, rows: 5 },
      timeout: 5000
    });

    return {
      status: 'success',
      statusCode: response.status,
      dataStructure: typeof response.data,
      sampleKeys: Object.keys(response.data || {}).slice(0, 5),
      dataSize: JSON.stringify(response.data || {}).length,
      note: 'MarketCheck API appears to work'
    };
  } catch (error: any) {
    return {
      status: 'failed',
      statusCode: error.response?.status || 0,
      error: error.message,
      errorCode: error.code,
      note: error.response?.status === 401 ? 'Invalid API key' : 
             error.response?.status === 429 ? 'Rate limit exceeded' :
             error.response?.status === 403 ? 'Access forbidden - may need subscription' :
             'Connection or other error'
    };
  }
}

async function testCISAPI(params: any) {
  try {
    const response = await axios.get('https://cis-automotive.p.rapidapi.com/getDealersByID', {
      headers: {
        'x-rapidapi-host': 'cis-automotive.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY || '',
      },
      params: { dealerID: '29319' },
      timeout: 5000
    });

    return {
      status: 'success',
      statusCode: response.status,
      dataStructure: typeof response.data,
      sampleKeys: Object.keys(response.data || {}).slice(0, 5),
      dataSize: JSON.stringify(response.data || {}).length,
      note: 'CIS Automotive API appears to work'
    };
  } catch (error: any) {
    return {
      status: 'failed',
      statusCode: error.response?.status || 0,
      error: error.message,
      errorCode: error.code,
      note: error.response?.status === 401 ? 'Invalid API key' : 
             error.response?.status === 429 ? 'Rate limit exceeded' :
             error.response?.status === 403 ? 'Access forbidden - may need subscription' :
             'Connection or other error'
    };
  }
}

async function testCarDataAPI(params: any) {
  try {
    const response = await axios.get('https://car-data.p.rapidapi.com/cars', {
      headers: {
        'x-rapidapi-host': 'car-data.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY || '',
      },
      params: { limit: 10, page: 0 },
      timeout: 5000
    });

    return {
      status: 'success',
      statusCode: response.status,
      dataStructure: typeof response.data,
      sampleKeys: Object.keys(response.data || {}).slice(0, 5),
      dataSize: JSON.stringify(response.data || {}).length,
      note: 'Car Data API appears to work'
    };
  } catch (error: any) {
    return {
      status: 'failed',
      statusCode: error.response?.status || 0,
      error: error.message,
      errorCode: error.code,
      note: error.response?.status === 401 ? 'Invalid API key' : 
             error.response?.status === 429 ? 'Rate limit exceeded' :
             error.response?.status === 403 ? 'Access forbidden - may need subscription' :
             'Connection or other error'
    };
  }
}

async function testFreeAlternatives(params: any) {
  const alternatives = [];

  // Test NHTSA API (Free US Government API)
  try {
    const nhtsaResponse = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${params.make}?format=json`,
      { timeout: 5000 }
    );
    alternatives.push({
      name: 'NHTSA API (Free)',
      status: 'success',
      dataAvailable: nhtsaResponse.data?.Results?.length || 0,
      note: 'Free US government vehicle data - limited but reliable'
    });
  } catch (error: any) {
    alternatives.push({
      name: 'NHTSA API (Free)',
      status: 'failed',
      error: error.message,
      note: 'Free US government API failed'
    });
  }

  // Test VPIC API (Free)
  try {
    const vpicResponse = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/getmakesformanufacturer/honda?format=json`,
      { timeout: 5000 }
    );
    alternatives.push({
      name: 'VPIC API (Free)',
      status: 'success',
      dataAvailable: vpicResponse.data?.Results?.length || 0,
      note: 'Free vehicle identification API'
    });
  } catch (error: any) {
    alternatives.push({
      name: 'VPIC API (Free)',
      status: 'failed',
      error: error.message,
      note: 'Free VPIC API failed'
    });
  }

  return alternatives;
}

// Mock data generator for when APIs fail
export function generateMockVehicleData(make: string, model: string, year: number) {
  return {
    make,
    model,
    year,
    bodyType: 'Sedan', // Default body type
    basicSpecifications: {
      make,
      model,
      year,
      bodyType: 'Sedan',
      engine: '3.0L V6 Turbocharged',
      engineCC: '3000',
      cylinders: '6',
      doors: 4,
      seats: 5,
      drivetrain: 'AWD',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline'
    },
    performanceData: {
      engine: '3.0L V6 Turbocharged',
      horsePower: '335 HP',
      torque: '330 lb-ft',
      acceleration060: '5.3 seconds',
      topSpeed: '155 mph',
      transmission: '8-Speed Automatic',
      driveType: 'AWD',
      weight: '4,400 lbs',
      fuelEconomy: '23 MPG combined'
    },
    pricingData: {
      baseMSRP: 55000,
      currentMarketRange: '£45,000 - £65,000',
      averageDealerPrice: 52000,
      dealerInventoryCount: 15,
      priceTrend: 'stable',
      priceDistribution: {
        min: 45000,
        max: 65000,
        median: 55000
      }
    },
    popularOptions: [
      { name: 'Premium Package', frequency: 8, source: 'mock' as const },
      { name: 'Sport Package', frequency: 6, source: 'mock' as const },
      { name: 'Technology Package', frequency: 7, source: 'mock' as const }
    ],
    dataSources: {
      database: false,
      carQuery: false,
      manufacturer: false,
      market: false,
      mock: true
    },
    note: 'This is mock data generated because APIs are not accessible'
  };
}