// src/lib/api-test.ts
// Admin API Test Suite - Run this to verify all endpoints are aligned

import type { 
  BuyCar, 
  RentalCar
} from '@/types/cars';
import type { 
  AdminDashboardStats
} from '@/types/admin';
import type { 
  SPASearchParams, 
  SPASearchResponse, 
  SPASuggestionResponse 
} from '@/types/spa';

// Test Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Admin API Tests
export const adminAPITests = {
  /**
   * Test Admin Dashboard Stats
   */
  async testDashboardStats(authToken: string): Promise<AdminDashboardStats> {
    const response = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Dashboard stats failed: ${response.status}`);
    
    const stats: AdminDashboardStats = await response.json();
    
    // Validate required fields
    const requiredFields = [
      'totalUsers', 'totalOrders', 'totalRentals', 'totalTradeIns',
      'pendingOrders', 'pendingRentals', 'pendingTradeIns',
      'carsForSale', 'carsForRent', 'monthlyRevenue',
      'popularMakes', 'recentActivity'
    ];
    
    requiredFields.forEach(field => {
      if (!(field in stats)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
    
    return stats;
  },

  /**
   * Test Admin Cars API
   */
  async testAdminCars(authToken: string, type: 'buy' | 'rent' = 'buy') {
    const response = await fetch(`${BASE_URL}/api/admin/cars?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Admin cars fetch failed: ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) throw new Error('Response missing success flag');
    if (!Array.isArray(result.data)) throw new Error('Data should be an array');
    
    // Validate car structure
    if (result.data.length > 0) {
      const car = result.data[0];
      
      if (type === 'buy') {
        const buyCar = car as BuyCar;
        if (!buyCar.price) throw new Error('Buy car missing price');
        if (!buyCar.specifications) throw new Error('Buy car missing specifications');
      } else {
        const rentalCar = car as RentalCar;
        if (!rentalCar.hourlyRate) throw new Error('Rental car missing hourlyRate');
        if (!rentalCar.dailyRate) throw new Error('Rental car missing dailyRate');
      }
    }
    
    return result;
  },

  /**
   * Test Create Car via Admin API
   */
  async testCreateCar(authToken: string, type: 'buy' | 'rent' = 'buy') {
    const carData = type === 'buy' ? {
      type: 'buy',
      make: 'Test',
      model: 'Model',
      year: 2024,
      price: 100000,
      specifications: {
        color: 'Black',
        interiorColor: 'Tan',
        mileage: 1000,
        engine: 'V8',
        horsePower: 500,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Coupe',
        driveType: 'RWD',
        seats: 2,
        doors: 2
      },
      features: {
        interior: ['Leather Seats'],
        exterior: ['LED Lights'],
        safety: ['ABS']
      },
      description: 'Test car',
      enrichWithSPA: false
    } : {
      type: 'rent',
      make: 'Test',
      model: 'Rental',
      year: 2024,
      hourlyRate: 100,
      dailyRate: 800,
      weeklyRate: 5000,
      specifications: {
        color: 'White',
        interiorColor: 'Black',
        mileage: 5000,
        engine: 'V6',
        horsePower: 400,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        bodyType: 'Sedan',
        driveType: 'AWD',
        seats: 4,
        doors: 4
      },
      features: {
        interior: ['Premium Audio'],
        exterior: ['Parking Sensors'],
        safety: ['Blind Spot Monitoring']
      },
      description: 'Test rental car'
    };

    const response = await fetch(`${BASE_URL}/api/admin/cars`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carData)
    });
    
    if (!response.ok) throw new Error(`Car creation failed: ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) throw new Error('Car creation unsuccessful');
    if (!result.data) throw new Error('No car data returned');
    
    return result;
  }
};

// SPA API Tests
export const spaAPITests = {
  /**
   * Test SPA Search
   */
  async testSPASearch(params: SPASearchParams): Promise<SPASearchResponse> {
    const response = await fetch(`${BASE_URL}/api/spa/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) throw new Error(`SPA search failed: ${response.status}`);
    
    const result: SPASearchResponse = await response.json();
    
    // Validate response structure
    if (!('success' in result)) throw new Error('Missing success field');
    if (!result.meta) throw new Error('Missing meta field');
    
    if (result.success && result.data) {
      // Validate data structure
      if (!result.data.make || !result.data.model || !result.data.year) {
        throw new Error('Invalid SPA data structure');
      }
      
      if (!result.data.dataSources) {
        throw new Error('Missing data sources information');
      }
    }
    
    return result;
  },

  /**
   * Test SPA Suggestions
   */
  async testSPASuggestions(
    type: 'make' | 'model' | 'year',
    make?: string,
    model?: string
  ): Promise<SPASuggestionResponse> {
    const params = new URLSearchParams({ type });
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    
    const response = await fetch(`${BASE_URL}/api/spa/suggestions?${params}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`SPA suggestions failed: ${response.status}`);
    
    const result: SPASuggestionResponse = await response.json();
    
    // Validate response structure
    if (!result.success) throw new Error('Suggestions request unsuccessful');
    if (!Array.isArray(result.suggestions)) throw new Error('Suggestions should be an array');
    
    // Validate suggestion structure
    if (result.suggestions.length > 0) {
      const suggestion = result.suggestions[0];
      if (!suggestion.value || !suggestion.label || !suggestion.type) {
        throw new Error('Invalid suggestion structure');
      }
    }
    
    return result;
  },

  /**
   * Test Batch Suggestions
   */
  async testBatchSuggestions(make?: string) {
    const response = await fetch(`${BASE_URL}/api/spa/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        types: ['make', 'model'],
        make
      })
    });
    
    if (!response.ok) throw new Error(`Batch suggestions failed: ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) throw new Error('Batch suggestions unsuccessful');
    if (!result.results) throw new Error('Missing results object');
    
    return result;
  }
};

// Public API Tests (no auth required)
export const publicAPITests = {
  /**
   * Test Public Cars Endpoint
   */
  async testPublicCars() {
    const response = await fetch(`${BASE_URL}/api/cars`);
    
    if (!response.ok) throw new Error(`Public cars fetch failed: ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) throw new Error('Response missing success flag');
    if (!Array.isArray(result.data)) throw new Error('Data should be an array');
    
    return result;
  },

  /**
   * Test Public Rentals Endpoint
   */
  async testPublicRentals() {
    const response = await fetch(`${BASE_URL}/api/rentals`);
    
    if (!response.ok) throw new Error(`Public rentals fetch failed: ${response.status}`);
    
    const result = await response.json();
    
    if (!result.success) throw new Error('Response missing success flag');
    if (!Array.isArray(result.data)) throw new Error('Data should be an array');
    
    return result;
  },

  /**
   * Test Single Car Endpoint
   */
  async testSingleCar(carId: string) {
    const response = await fetch(`${BASE_URL}/api/cars/${carId}`);
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`Single car fetch failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (response.ok) {
      if (!result.success) throw new Error('Response missing success flag');
      if (!result.data) throw new Error('Missing car data');
    }
    
    return result;
  }
};

// Run all tests
interface TestResults {
  admin: Record<string, unknown>;
  spa: Record<string, unknown>;
  public: Record<string, unknown>;
  errors: string[];
}

export async function runAllAPITests(authToken?: string) {
  const results: TestResults = {
    admin: {},
    spa: {},
    public: {},
    errors: []
  };

  // Test Public APIs
  try {
    console.log('Testing Public APIs...');
    results.public.cars = await publicAPITests.testPublicCars();
    console.log('✓ Public cars endpoint');
  } catch (error) {
    results.errors.push(`Public cars: ${error}`);
    console.error('✗ Public cars endpoint:', error);
  }

  try {
    results.public.rentals = await publicAPITests.testPublicRentals();
    console.log('✓ Public rentals endpoint');
  } catch (error) {
    results.errors.push(`Public rentals: ${error}`);
    console.error('✗ Public rentals endpoint:', error);
  }

  // Test SPA APIs
  try {
    console.log('\nTesting SPA APIs...');
    results.spa.search = await spaAPITests.testSPASearch({
      make: 'Ferrari',
      model: '488',
      year: 2020,
      dataSource: 'comprehensive'
    });
    console.log('✓ SPA search endpoint');
  } catch (error) {
    results.errors.push(`SPA search: ${error}`);
    console.error('✗ SPA search endpoint:', error);
  }

  try {
    results.spa.makeSuggestions = await spaAPITests.testSPASuggestions('make');
    console.log('✓ SPA make suggestions');
  } catch (error) {
    results.errors.push(`SPA suggestions: ${error}`);
    console.error('✗ SPA make suggestions:', error);
  }

  // Test Admin APIs (if token provided)
  if (authToken) {
    try {
      console.log('\nTesting Admin APIs...');
      results.admin.dashboard = await adminAPITests.testDashboardStats(authToken);
      console.log('✓ Admin dashboard stats');
    } catch (error) {
      results.errors.push(`Admin dashboard: ${error}`);
      console.error('✗ Admin dashboard stats:', error);
    }

    try {
      results.admin.buyCars = await adminAPITests.testAdminCars(authToken, 'buy');
      console.log('✓ Admin buy cars');
    } catch (error) {
      results.errors.push(`Admin buy cars: ${error}`);
      console.error('✗ Admin buy cars:', error);
    }

    try {
      results.admin.rentalCars = await adminAPITests.testAdminCars(authToken, 'rent');
      console.log('✓ Admin rental cars');
    } catch (error) {
      results.errors.push(`Admin rental cars: ${error}`);
      console.error('✗ Admin rental cars:', error);
    }
  } else {
    console.log('\n⚠ Skipping Admin API tests (no auth token provided)');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (results.errors.length === 0) {
    console.log('✅ All API tests passed!');
  } else {
    console.log(`❌ ${results.errors.length} test(s) failed:`);
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  console.log('='.repeat(50));

  return results;
}

// Export for use in components or scripts
const APITests = {
  adminAPITests,
  spaAPITests,
  publicAPITests,
  runAllAPITests
};

export default APITests;
