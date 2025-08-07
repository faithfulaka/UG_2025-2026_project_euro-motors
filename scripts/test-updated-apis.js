#!/usr/bin/env node
// Test script for the updated APIs with correct endpoints

const https = require('https');
const RAPIDAPI_KEY = '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

console.log('🚀 TESTING UPDATED APIs (Without Edmunds)');
console.log('==========================================\n');

// Test configurations
const tests = [
  {
    name: 'Car Data API - GET /cars',
    options: {
      hostname: 'car-data.p.rapidapi.com',
      path: '/cars?limit=5&make=BMW&model=X5&year=2023',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-data.p.rapidapi.com'
      }
    }
  },
  {
    name: 'CIS Automotive - GET /getBrands',
    options: {
      hostname: 'cis-automotive.p.rapidapi.com',
      path: '/getBrands',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'cis-automotive.p.rapidapi.com'
      }
    }
  },
  {
    name: 'Car API2 - GET /api/years',
    options: {
      hostname: 'car-api2.p.rapidapi.com',
      path: '/api/years',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-api2.p.rapidapi.com'
      }
    }
  },
  {
    name: 'Car API2 - VIN Decode',
    options: {
      hostname: 'car-api2.p.rapidapi.com',
      path: '/api/vin/1GTG6CEN0L1139305',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-api2.p.rapidapi.com'
      }
    }
  },
  {
    name: 'MarketCheck - GET /search',
    options: {
      hostname: 'marketcheck-cars-search-v1.p.rapidapi.com',
      path: '/search?make=BMW&model=X5&year=2023&rows=5',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'marketcheck-cars-search-v1.p.rapidapi.com'
      }
    }
  }
];

// Test function
function testAPI(config) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${config.name}`);
    
    const req = https.request(config.options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ ${config.name}: SUCCESS`);
            
            // Show relevant data based on API
            if (config.name.includes('Car Data')) {
              console.log(`   Found ${Array.isArray(json) ? json.length : 0} cars`);
            } else if (config.name.includes('CIS')) {
              console.log(`   Found ${Array.isArray(json) ? json.length : 0} brands`);
            } else if (config.name.includes('years')) {
              console.log(`   Years available: ${Array.isArray(json) ? json.slice(0, 5).join(', ') : 'N/A'}`);
            } else if (config.name.includes('VIN')) {
              console.log(`   Decoded: ${json.year} ${json.make} ${json.model}`);
            } else if (config.name.includes('MarketCheck')) {
              console.log(`   Found ${json.num_found || 0} listings`);
            }
            
            resolve({ name: config.name, status: 'success' });
          } catch (e) {
            console.log(`⚠️  ${config.name}: Response received but not JSON`);
            resolve({ name: config.name, status: 'partial' });
          }
        } else {
          console.log(`❌ ${config.name}: HTTP ${res.statusCode}`);
          const errorMsg = data.substring(0, 100);
          console.log(`   Error: ${errorMsg}`);
          resolve({ name: config.name, status: 'failed', code: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${config.name}: Network error - ${error.message}`);
      resolve({ name: config.name, status: 'error', error: error.message });
    });
    
    req.end();
  });
}

// Main execution
async function runTests() {
  const results = [];
  
  for (const config of tests) {
    const result = await testAPI(config);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n==========================================');
  console.log('📊 RESULTS SUMMARY');
  console.log('==========================================');
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
  
  console.log(`✅ Successful: ${successful}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  console.log('\n📋 Individual Results:');
  results.forEach(r => {
    const icon = r.status === 'success' ? '✅' : r.status === 'partial' ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}${r.code ? ` (HTTP ${r.code})` : ''}`);
  });
  
  console.log('\n💡 ARCHITECTURE:');
  console.log('==========================================');
  console.log('✅ Removed: Edmunds API (not needed)');
  console.log('✅ Using: Only specified endpoints');
  console.log('✅ Data: Intelligently combined without redundancy');
  console.log('✅ Parsing: Proper error handling and type checking');
  
  console.log('\n🎯 DATA STRUCTURE:');
  console.log('==========================================');
  console.log('• Basic Info: Make, Model, Year, Trim, Body Type');
  console.log('• Specifications: Engine, Transmission, Fuel Economy, Colors');
  console.log('• Pricing: MSRP, Invoice, Valuation, Market Stats');
  console.log('• Listings: Current market inventory with prices');
  
  console.log('\n📝 NEXT STEPS:');
  console.log('==========================================');
  if (successful === tests.length) {
    console.log('🎉 All APIs working! Start your server:');
    console.log('   npm run dev');
    console.log('   http://localhost:3000/api/spa/comprehensive?make=BMW&model=X5&year=2023');
  } else {
    console.log('⚠️  Some APIs need subscription. Visit:');
    console.log('   https://rapidapi.com/car-data/api/car-data');
    console.log('   https://rapidapi.com/cis-automotive/api/cis-automotive');
    console.log('   https://rapidapi.com/marketcheck/api/marketcheck-cars-search-v1');
  }
  
  console.log('\n');
}

// Run the tests
runTests().catch(console.error);
