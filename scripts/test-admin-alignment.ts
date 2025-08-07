// scripts/test-admin-alignment.ts
// Quick test script to verify all systems are aligned and working
// Run with: npx tsx scripts/test-admin-alignment.ts

import { api } from '../src/lib/api-client';
import { validators } from '../src/lib/type-validators';
import { runAllAPITests } from '../src/lib/api-test';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  adminToken: process.env.ADMIN_TOKEN || '', // Set this to test admin endpoints
  runAdminTests: false, // Set to true if you have an admin token
};

// Helper functions
function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(50));
  log(title, colors.cyan);
  console.log('='.repeat(50));
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Main test function
async function testSystemAlignment() {
  console.clear();
  log('🚀 Euro Motors System Alignment Test', colors.blue);
  log(`Testing against: ${TEST_CONFIG.baseUrl}`, colors.blue);
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Type Validators
  logSection('1. Testing Type Validators');
  
  try {
    // Test CarSpecifications validation
    const validSpecs = {
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
    };
    
    totalTests++;
    if (validators.carSpecifications(validSpecs)) {
      logSuccess('CarSpecifications validator works');
      passedTests++;
    } else {
      throw new Error('Valid specs failed validation');
    }
    
    // Test invalid specs
    totalTests++;
    if (!validators.carSpecifications({ color: 'Black' })) {
      logSuccess('CarSpecifications validator rejects invalid data');
      passedTests++;
    } else {
      throw new Error('Invalid specs passed validation');
    }
    
    // Test CarFeatures validation
    const validFeatures = {
      interior: ['Leather Seats'],
      exterior: ['LED Lights'],
      safety: ['ABS']
    };
    
    totalTests++;
    if (validators.carFeatures(validFeatures)) {
      logSuccess('CarFeatures validator works');
      passedTests++;
    } else {
      throw new Error('Valid features failed validation');
    }
    
  } catch (error) {
    logError(`Type validator tests failed: ${error}`);
    failedTests++;
  }
  
  // Test 2: Public API Endpoints
  logSection('2. Testing Public API Endpoints');
  
  try {
    // Test public cars endpoint
    totalTests++;
    const carsResponse = await api.public.getCars();
    if (carsResponse.success !== undefined) {
      logSuccess('Public cars endpoint responds with correct structure');
      passedTests++;
      
      if (carsResponse.data && carsResponse.data.length > 0) {
        totalTests++;
        const car = carsResponse.data[0];
        if (validators.buyCar(car)) {
          logSuccess(`First car validates correctly as BuyCar type`);
          passedTests++;
        } else {
          throw new Error('Car data doesn\'t match BuyCar type');
        }
      } else {
        logWarning('No cars in database to validate');
      }
    } else {
      throw new Error('Invalid response structure');
    }
    
    // Test public rentals endpoint
    totalTests++;
    const rentalsResponse = await api.public.getRentalCars();
    if (rentalsResponse.success !== undefined) {
      logSuccess('Public rentals endpoint responds with correct structure');
      passedTests++;
      
      if (rentalsResponse.data && rentalsResponse.data.length > 0) {
        totalTests++;
        const rental = rentalsResponse.data[0];
        if (validators.rentalCar(rental)) {
          logSuccess(`First rental validates correctly as RentalCar type`);
          passedTests++;
        } else {
          throw new Error('Rental data doesn\'t match RentalCar type');
        }
      } else {
        logWarning('No rental cars in database to validate');
      }
    } else {
      throw new Error('Invalid response structure');
    }
    
  } catch (error) {
    logError(`Public API tests failed: ${error}`);
    failedTests++;
  }
  
  // Test 3: SPA API Endpoints
  logSection('3. Testing SPA API Endpoints');
  
  try {
    // Test SPA search
    totalTests++;
    const spaResponse = await api.spa.search({
      make: 'Ferrari',
      model: '488',
      year: 2020,
      dataSource: 'comprehensive'
    });
    
    if (spaResponse.success !== undefined && spaResponse.meta) {
      logSuccess('SPA search endpoint responds with correct structure');
      passedTests++;
      
      if (spaResponse.success && spaResponse.data) {
        totalTests++;
        if (validators.comprehensiveSPAData(spaResponse.data)) {
          logSuccess('SPA data validates correctly');
          passedTests++;
        } else {
          throw new Error('SPA data doesn\'t match ComprehensiveSPAData type');
        }
      }
    } else {
      throw new Error('Invalid SPA response structure');
    }
    
    // Test SPA suggestions
    totalTests++;
    const suggestionsResponse = await api.spa.getMakeSuggestions();
    if (suggestionsResponse.success && Array.isArray(suggestionsResponse.suggestions)) {
      logSuccess('SPA suggestions endpoint works');
      passedTests++;
      
      if (suggestionsResponse.suggestions.length > 0) {
        totalTests++;
        const suggestion = suggestionsResponse.suggestions[0];
        if (validators.spaSuggestion(suggestion)) {
          logSuccess('SPA suggestion validates correctly');
          passedTests++;
        } else {
          throw new Error('Suggestion doesn\'t match SPASuggestion type');
        }
      }
    } else {
      throw new Error('Invalid suggestions response');
    }
    
  } catch (error) {
    logError(`SPA API tests failed: ${error}`);
    failedTests++;
  }
  
  // Test 4: Admin API Endpoints (if token provided)
  if (TEST_CONFIG.adminToken && TEST_CONFIG.runAdminTests) {
    logSection('4. Testing Admin API Endpoints');
    
    try {
      // Test dashboard stats
      totalTests++;
      const statsResponse = await api.admin.getDashboardStats(TEST_CONFIG.adminToken);
      if (statsResponse.success && statsResponse.data) {
        if (validators.adminDashboardStats(statsResponse.data)) {
          logSuccess('Admin dashboard stats validate correctly');
          passedTests++;
        } else {
          throw new Error('Dashboard stats don\'t match AdminDashboardStats type');
        }
      } else {
        throw new Error('Invalid dashboard response');
      }
      
      // Test admin cars
      totalTests++;
      const adminCarsResponse = await api.admin.getCars(TEST_CONFIG.adminToken, 'buy');
      if (adminCarsResponse.success !== undefined) {
        logSuccess('Admin cars endpoint responds correctly');
        passedTests++;
      } else {
        throw new Error('Invalid admin cars response');
      }
      
    } catch (error) {
      logError(`Admin API tests failed: ${error}`);
      failedTests++;
    }
  } else {
    logSection('4. Admin API Tests');
    logWarning('Skipping admin tests (no token provided)');
    logWarning('Set ADMIN_TOKEN env variable and runAdminTests=true to test admin endpoints');
  }
  
  // Test 5: Run comprehensive API tests
  logSection('5. Running Comprehensive API Tests');
  
  try {
    const testResults = await runAllAPITests(TEST_CONFIG.adminToken);
    
    if (testResults.errors.length === 0) {
      logSuccess('All comprehensive API tests passed!');
      passedTests++;
    } else {
      logError(`${testResults.errors.length} comprehensive test(s) failed`);
      testResults.errors.forEach(err => {
        logError(`  - ${err}`);
      });
      failedTests += testResults.errors.length;
    }
    totalTests++;
    
  } catch (error) {
    logError(`Comprehensive tests failed: ${error}`);
    failedTests++;
  }
  
  // Final Summary
  logSection('Test Summary');
  
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  log(`Total Tests: ${totalTests}`, colors.blue);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${failedTests}`, colors.red);
  log(`Success Rate: ${successRate}%`, 
    failedTests === 0 ? colors.green : colors.yellow
  );
  
  if (failedTests === 0) {
    console.log('\n' + '🎉'.repeat(10));
    log('SYSTEM IS FULLY ALIGNED AND OPERATIONAL!', colors.green);
    console.log('🎉'.repeat(10));
  } else {
    console.log('\n' + '⚠️'.repeat(10));
    log('SYSTEM HAS ALIGNMENT ISSUES - PLEASE REVIEW FAILURES', colors.red);
    console.log('⚠️'.repeat(10));
  }
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
testSystemAlignment().catch(error => {
  logError(`Fatal error: ${error}`);
  process.exit(1);
});
