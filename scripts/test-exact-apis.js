#!/usr/bin/env node
// Test with exact API configurations from your examples

const https = require('https');

const RAPIDAPI_KEY = '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

console.log('🚀 Testing APIs with Your Exact Examples');
console.log('=========================================\n');

// Test 1: Car Data API
function testCarData() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      hostname: 'car-data.p.rapidapi.com',
      port: null,
      path: '/cars?limit=10&page=0',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-data.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Car Data API: WORKING');
          const parsed = JSON.parse(data);
          console.log(`   Found ${parsed.length} cars`);
        } else {
          console.log(`❌ Car Data API: HTTP ${res.statusCode}`);
          console.log(`   ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ Car Data API: ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Test 2: CIS Automotive API
function testCIS() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      hostname: 'cis-automotive.p.rapidapi.com',
      port: null,
      path: '/getDealersByID?dealerID=29319',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'cis-automotive.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ CIS Automotive API: WORKING');
          console.log(`   Dealer data retrieved`);
        } else {
          console.log(`❌ CIS Automotive API: HTTP ${res.statusCode}`);
          console.log(`   ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ CIS Automotive API: ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Test 3: Car API2 (VIN Decoder)
function testCarAPI2() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      hostname: 'car-api2.p.rapidapi.com',
      port: null,
      path: '/api/vin/1GTG6CEN0L1139305',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-api2.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Car API2 (VIN Decoder): WORKING');
          const parsed = JSON.parse(data);
          console.log(`   VIN decoded: ${parsed.year} ${parsed.make} ${parsed.model}`);
        } else {
          console.log(`❌ Car API2: HTTP ${res.statusCode}`);
          console.log(`   ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ Car API2: ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Test 4: Edmunds API
function testEdmunds() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      hostname: 'community-edmunds.p.rapidapi.com',
      port: null,
      path: '/api/vehicle/v2/grade/200434856?fmt=json',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'community-edmunds.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Edmunds API: WORKING');
          console.log(`   Vehicle grade data retrieved`);
        } else {
          console.log(`❌ Edmunds API: HTTP ${res.statusCode}`);
          console.log(`   ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ Edmunds API: ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Test 5: MarketCheck API (simplified)
function testMarketCheck() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      hostname: 'marketcheck-cars-search-v1.p.rapidapi.com',
      port: null,
      path: '/search',  // Just the base search endpoint
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'marketcheck-cars-search-v1.p.rapidapi.com'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ MarketCheck API: WORKING');
          const parsed = JSON.parse(data);
          console.log(`   Found ${parsed.listings?.length || 0} listings`);
        } else {
          console.log(`❌ MarketCheck API: HTTP ${res.statusCode}`);
          console.log(`   ${data.substring(0, 100)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ MarketCheck API: ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Testing Car Data API...');
  await testCarData();
  console.log('');
  
  console.log('Testing CIS Automotive API...');
  await testCIS();
  console.log('');
  
  console.log('Testing Car API2 (VIN Decoder)...');
  await testCarAPI2();
  console.log('');
  
  console.log('Testing Edmunds API...');
  await testEdmunds();
  console.log('');
  
  console.log('Testing MarketCheck API...');
  await testMarketCheck();
  console.log('');
  
  console.log('=========================================');
  console.log('✅ Test Complete!');
  console.log('');
  console.log('If all APIs show as WORKING, you can start using:');
  console.log('  npm run dev');
  console.log('  http://localhost:3000/api/spa/comprehensive?make=BMW&model=X5&year=2023');
}

runTests().catch(console.error);
