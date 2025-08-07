// Quick API validation test - run with: node scripts/quick-api-test.js
const https = require('https');

const RAPIDAPI_KEY = '8e431933a5mshad199d436e3caf1p14df7djsn56edbda4c8c5';

// Test configurations for each API
const apiTests = [
  {
    name: 'Car Data API',
    options: {
      hostname: 'car-data.p.rapidapi.com',
      port: 443,
      path: '/cars?limit=2&page=0&make=BMW&model=X5&year=2023',
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-data.p.rapidapi.com'
      }
    }
  },
  {
    name: 'CIS Automotive API',
    options: {
      hostname: 'cis-automotive.p.rapidapi.com',
      port: 443,
      path: '/getDealersByID?dealerID=29319',
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'cis-automotive.p.rapidapi.com'
      }
    }
  },
  {
    name: 'Car API2 (VIN Decoder)',
    options: {
      hostname: 'car-api2.p.rapidapi.com',
      port: 443,
      path: '/api/vin/1GTG6CEN0L1139305',
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'car-api2.p.rapidapi.com'
      }
    }
  },
  {
    name: 'MarketCheck API',
    options: {
      hostname: 'marketcheck-cars-search-v1.p.rapidapi.com',
      port: 443,
      path: '/search?make=BMW&model=X5&year=2023&rows=2',
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'marketcheck-cars-search-v1.p.rapidapi.com'
      }
    }
  },
  {
    name: 'Edmunds API',
    options: {
      hostname: 'community-edmunds.p.rapidapi.com',
      port: 443,
      path: '/api/vehicle/v2/grade/200434856?fmt=json',
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'community-edmunds.p.rapidapi.com'
      }
    }
  }
];

// Test function
function testAPI(config) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${config.name}...`);
    
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
            console.log(`   Response preview:`, JSON.stringify(json).substring(0, 100) + '...');
            resolve({ name: config.name, status: 'success' });
          } catch (e) {
            console.log(`⚠️  ${config.name}: Response received but not JSON`);
            resolve({ name: config.name, status: 'partial' });
          }
        } else {
          console.log(`❌ ${config.name}: HTTP ${res.statusCode}`);
          console.log(`   Error:`, data.substring(0, 100));
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
  console.log('🚀 Euro Motors API Validation');
  console.log('================================');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔑 API Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);
  
  const results = [];
  
  // Test each API
  for (const config of apiTests) {
    const result = await testAPI(config);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 RESULTS SUMMARY');
  console.log('================================');
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
  const partial = results.filter(r => r.status === 'partial').length;
  
  console.log(`✅ Successful: ${successful}/${apiTests.length}`);
  console.log(`⚠️  Partial: ${partial}/${apiTests.length}`);
  console.log(`❌ Failed: ${failed}/${apiTests.length}`);
  
  console.log('\n📋 Individual Results:');
  results.forEach(r => {
    const icon = r.status === 'success' ? '✅' : r.status === 'partial' ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}${r.code ? ` (HTTP ${r.code})` : ''}`);
  });
  
  if (successful === apiTests.length) {
    console.log('\n🎉 All APIs are working perfectly!');
  } else if (successful > 0) {
    console.log(`\n⚠️  ${successful} APIs working, ${failed} need attention.`);
  } else {
    console.log('\n❌ APIs are not responding. Check your API key and network connection.');
  }
  
  console.log('\n💡 Next step: Start your dev server with "npm run dev"');
  console.log('   Then visit: http://localhost:3000/spa-demo\n');
}

// Run the tests
runTests().catch(console.error);
